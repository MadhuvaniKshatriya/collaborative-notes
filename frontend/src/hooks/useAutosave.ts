import { useEffect } from "react";
import debounce from "lodash.debounce";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../app/store";
import {
  startSaving,
  saveSuccess,
  saveError,
  setConflict,
} from "../features/notes/notesSlice";

export const useAutosave = () => {
  const dispatch = useDispatch();
  const { activeNoteId, localContent, notes, requestSequence } =
    useSelector((state: RootState) => state.notes);

  const debouncedSave = debounce(async () => {
    if (!activeNoteId) return;

    dispatch(startSaving());
    const seq = requestSequence + 1;
    const version = notes[activeNoteId].version;

    try {
      const res = await fakeApiSave(
        activeNoteId,
        localContent,
        version
      );

      if (res.conflict) {
        dispatch(setConflict(res));
      } else {
        dispatch(
          saveSuccess({
            content: localContent,
            version: res.version,
            seq,
          })
        );
      }
    } catch {
      dispatch(saveError());
    }
  }, 800);

  useEffect(() => {
    debouncedSave();
    return () => debouncedSave.cancel();
  }, [localContent]);
};

async function fakeApiSave(
  noteId: string,
  content: string,
  version: number
) {
  await new Promise((r) => setTimeout(r, 500));

  return {
    version: version + 1,
    conflict: false,
  };
}
