import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../app/store";
import { setActiveNote } from "../../features/notes/notesSlice";

export default function RevisionPanel() {
  const dispatch = useDispatch();

  const { activeNoteId, revisions } = useSelector(
    (state: RootState) => state.notes
  );

  if (!activeNoteId) return null;

  const noteRevisions = revisions[activeNoteId] || [];

  return (
    <div className="border-l w-1/4 bg-white p-4 overflow-y-auto">
      <h2 className="font-semibold mb-4">Revision History</h2>

      {noteRevisions.map((rev) => (
        <div
          key={rev.id}
          className="mb-3 p-3 border rounded text-sm"
        >
          <div>Version: {rev.version}</div>
          <div className="text-gray-500 text-xs">
            {new Date(rev.editedAt).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}
