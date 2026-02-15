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

/* ============================
   Fake API Call (Replace Later)
============================ */

async function fakeApiSave(
  noteId: string,
  blocks: any[],
  version: number
) {
  // simulate network delay
  await new Promise((r) => setTimeout(r, 500));

  return {
    version: version + 1,
    conflict: false,
    remoteBlocks: blocks,
  };
}

/* ============================
   Hook
============================ */

export const useAutosave = () => {
  const dispatch = useDispatch();

  const {
    activeNoteId,
    localBlocks,
    notes,
    requestSequence,
    saveStatus,
  } = useSelector((state: RootState) => state.notes);

  const latestSeqRef = useRef(requestSequence);

  useEffect(() => {
    latestSeqRef.current = requestSequence;
  }, [requestSequence]);

  const debouncedSave = useRef(
    debounce(async () => {
      if (!activeNoteId) return;

      const note = notes[activeNoteId];
      if (!note) return;

      // Only save if unsaved
      if (saveStatus.state !== "unsaved") return;

      dispatch(startSaving());

      const currentSeq = latestSeqRef.current + 1;
      const currentVersion = note.version;

      try {
        const response = await fakeApiSave(
          activeNoteId,
          localBlocks,
          currentVersion
        );

        if (response.conflict) {
          dispatch(
            setConflict({
              remoteBlocks: response.remoteBlocks,
              remoteVersion: response.version,
            })
          );
        } else {
          dispatch(
            saveSuccess({
              version: response.version,
              seq: currentSeq,
            })
          );
        }
      } catch (err) {
        dispatch(saveError());
      }
    }, 800)
  ).current;

  /* ============================
     Trigger on block change
  ============================ */

  useEffect(() => {
  if (!activeNoteId) return;

  if (saveStatus.state !== "unsaved") return;

  debouncedSave();

  return () => debouncedSave.cancel();
}, [localBlocks]);

};
