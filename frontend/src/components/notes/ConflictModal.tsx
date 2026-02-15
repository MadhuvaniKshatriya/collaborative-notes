import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../app/store";
import {
  resolveConflictWithLocal,
  resolveConflictWithRemote,
} from "../../features/notes/notesSlice";

export default function ConflictModal() {
  const dispatch = useDispatch();

  const { saveStatus, conflictData } = useSelector(
    (state: RootState) => state.notes
  );

  if (saveStatus.state !== "conflict" || !conflictData) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-3/4 max-w-4xl p-6 rounded shadow-lg">
        <h2 className="text-lg font-semibold mb-4 text-orange-600">
          Conflict Detected
        </h2>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <h3 className="font-medium mb-2">Your Version</h3>
            <textarea
              readOnly
              value={conflictData.localContent}
              className="w-full h-48 border p-3 bg-gray-50"
            />
          </div>

          <div>
            <h3 className="font-medium mb-2">Remote Version</h3>
            <textarea
              readOnly
              value={conflictData.remoteContent}
              className="w-full h-48 border p-3 bg-gray-50"
            />
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={() => dispatch(resolveConflictWithLocal())}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Keep Mine
          </button>

          <button
            onClick={() => dispatch(resolveConflictWithRemote())}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            Use Remote
          </button>
        </div>
      </div>
    </div>
  );
}
