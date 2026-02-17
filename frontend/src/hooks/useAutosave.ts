import { useEffect, useRef } from "react";
import debounce from "lodash.debounce";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../app/store";
import {
  startSaving,
  saveSuccess,
  saveError,
  setConflict,
} from "../features/notes/notesSlice";
import { updateNote, fetchNote } from "../features/notes/notesApi";

export const useAutosave = () => {
  const dispatch = useDispatch();

  const {
    activeNoteId,
    localBlocks,
    version,
    saveStatus,
    notes,
  } = useSelector((state: RootState) => state.notes);

  const { currentWorkspaceId } = useSelector(
    (state: RootState) => state.workspace
  );

  const debouncedSave = useRef(
    debounce(
      async (
        workspaceId: string,
        noteId: string,
        blocks: any[],
        version: number,
        title: string
      ) => {
        dispatch(startSaving());

        try {
          const data = await updateNote(
            workspaceId,
            noteId,
            title,
            blocks,
            version
          );

          dispatch(
            saveSuccess({
              version: data.version,
            })
          );
        } catch (err: any) {
          if (err.message === "CONFLICT" || err.status === 409) {
            console.log("Conflict detected:", err);
            try {
              const remote = await fetchNote(workspaceId, noteId);
              dispatch(
                setConflict({
                  remoteBlocks: remote.blocks,
                  remoteVersion: remote.version,
                  lastEditedBy: err.conflict?.lastEditedBy || 'Unknown',
                  lastEditedAt: err.conflict?.lastEditedAt,
                })
              );
            } catch (fetchErr) {
              console.error(
                "Failed to fetch remote note for conflict",
                fetchErr
              );
              dispatch(saveError());
            }
          } else {
            console.error("Save error:", err);
            dispatch(saveError());
          }
        }
      },
      800
    )
  ).current;

  useEffect(() => {
    if (!activeNoteId || !currentWorkspaceId) return;
    if (saveStatus.state !== "unsaved") return;

    const note = notes[activeNoteId];
    if (!note) return;

    debouncedSave(currentWorkspaceId, activeNoteId, localBlocks, version, note.title);

    return () => debouncedSave.cancel();
  }, [
    localBlocks,
    saveStatus.state,
    activeNoteId,
    currentWorkspaceId,
    version,
    notes,
    dispatch,
    debouncedSave,
  ]);
};

