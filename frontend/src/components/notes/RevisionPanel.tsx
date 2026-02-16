import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import type { RootState } from "../../app/store";
import type { Revision } from "../../features/notes/types";
import { fetchRevisions } from "../../features/notes/notesApi";
import { restoreRevisionThunk } from "../../features/notes/notesThunk";

export default function RevisionPanel() {
  const dispatch = useDispatch();
  const { activeNoteId } = useSelector(
    (state: RootState) => state.notes
  );
  const [noteRevisions, setNoteRevisions] = useState<Revision[]>([]);
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    if (!activeNoteId) {
      setNoteRevisions([]);
      return;
    }

    const fetchRevisionData = async () => {
      setLoading(true);
      try {
        const data = await fetchRevisions(activeNoteId);
        setNoteRevisions(data);
      } catch (err) {
        console.error("Failed to fetch revisions", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRevisionData();
  }, [activeNoteId]);

  const handleRestore = async (revisionId: string) => {
    setRestoring(true);
    try {
      await dispatch(restoreRevisionThunk(revisionId) as any);
      // Refresh revisions list
      if (activeNoteId) {
        const data = await fetchRevisions(activeNoteId);
        setNoteRevisions(data);
      }
    } catch (err) {
      console.error("Failed to restore revision", err);
    } finally {
      setRestoring(false);
    }
  };

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
        ) : loading ? (
          <div className="text-sm text-gray-400">
            Loading revisions...
          </div>
        ) : noteRevisions.length === 0 ? (
          <div className="text-sm text-gray-400">
            No revisions yet
          </div>
        ) : (
          noteRevisions.map((rev: Revision) => (
            <div
              key={rev.id}
              className="mb-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition border border-gray-200"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="text-sm font-medium">
                    Version {rev.version}
                  </div>
                  <div className="text-gray-500 text-xs mt-1">
                    {new Date(rev.createdAt).toLocaleString()}
                  </div>
                  <div className="text-gray-600 text-xs mt-2 max-h-16 overflow-hidden">
                    {rev.blocks
                      .slice(0, 2)
                      .map((b) => b.content)
                      .join(" ")}
                  </div>
                </div>
                <button
                  onClick={() => handleRestore(rev.id)}
                  disabled={restoring}
                  className="ml-2 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 transition"
                >
                  {restoring ? "Restoring..." : "Restore"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
