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

  const debouncedSave = useRef(
    debounce(async (noteId: string, blocks: any[], version: number, title: string) => {
      dispatch(startSaving());

      try {
        const data = await updateNote(
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
          try {
            const remote = await fetchNote(noteId);
            dispatch(
              setConflict({
                remoteBlocks: remote.blocks,
                remoteVersion: remote.version,
              })
            );
          } catch (fetchErr) {
            console.error("Failed to fetch remote note for conflict", fetchErr);
            dispatch(saveError());
          }
        } else {
          console.error("Save error:", err);
          dispatch(saveError());
        }
      }
    }, 800)
  ).current;

  useEffect(() => {
    if (!activeNoteId) return;
    if (saveStatus.state !== "unsaved") return;

    const note = notes[activeNoteId];
    if (!note) return;

    debouncedSave(
      activeNoteId,
      localBlocks,
      version,
      note.title
    );

    return () => debouncedSave.cancel();
  }, [localBlocks, saveStatus.state, activeNoteId, version, notes, dispatch, debouncedSave]);
};
