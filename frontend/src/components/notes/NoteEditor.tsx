import { useAutosave } from "../../hooks/useAutosave";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../app/store";
import { updateLocalContent } from "../../features/notes/notesSlice";
import { useBeforeUnloadGuard } from "../../hooks/useBeforeUnloadGuard";

export default function NoteEditor() {
  const dispatch = useDispatch();
  const { activeNoteId, localContent, saveStatus } = useSelector(
    (state: RootState) => state.notes
  );
  const shouldBlock =
  !!activeNoteId &&
  (saveStatus.state === "unsaved" ||
   saveStatus.state === "saving");

useBeforeUnloadGuard(shouldBlock);


  useAutosave();

  if (!activeNoteId) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        Select a note to start editing
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      <div className="p-4 border-b bg-white flex justify-between items-center">
        <span className="text-sm font-medium">
          Status:{" "}
          <span
            className={`ml-1 ${
              saveStatus.state === "saving"
                ? "text-yellow-500"
                : saveStatus.state === "saved"
                ? "text-green-600"
                : saveStatus.state === "error"
                ? "text-red-600"
                : saveStatus.state === "conflict"
                ? "text-orange-600"
                : "text-gray-500"
            }`}
          >
            {saveStatus.state}
          </span>
        </span>
      </div>

      <textarea
        className="flex-1 p-6 outline-none resize-none bg-white"
        value={localContent}
        onChange={(e) => dispatch(updateLocalContent(e.target.value))}
      />
    </div>
  );
}
