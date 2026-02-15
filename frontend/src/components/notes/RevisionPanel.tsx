import { useSelector } from "react-redux";
import type { RootState } from "../../app/store";

export default function RevisionPanel() {
  const { activeNoteId, revisions } = useSelector(
    (state: RootState) => state.notes
  );

  const noteRevisions = activeNoteId
    ? revisions[activeNoteId] || []
    : [];

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="font-semibold">
          Revision History
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {!activeNoteId ? (
          <div className="text-sm text-gray-400">
            Select a note to view revisions
          </div>
        ) : noteRevisions.length === 0 ? (
          <div className="text-sm text-gray-400">
            No revisions yet
          </div>
        ) : (
          noteRevisions.map((rev) => (
            <div
              key={rev.id}
              className="mb-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition border border-gray-200"
            >
              <div className="text-sm font-medium">
                Version {rev.version}
              </div>
              <div className="text-gray-500 text-xs mt-1">
                {new Date(rev.editedAt).toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
