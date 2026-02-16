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
    <div className="h-full flex flex-col bg-white">
      <div className="p-6 border-b border-neutral-200 bg-white">
        <h2 className="font-bold text-lg text-neutral-900">
          ⏰ Version History
        </h2>
        <p className="text-xs text-neutral-500 mt-1">Browse and restore versions</p>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {!activeNoteId ? (
          <div className="text-sm text-neutral-400 italic text-center py-8">
            Select a note to view its history
          </div>
        ) : loading ? (
          <div className="text-sm text-neutral-400 italic text-center py-8">
            Loading versions...
          </div>
        ) : noteRevisions.length === 0 ? (
          <div className="text-sm text-neutral-400 italic text-center py-8">
            No versions yet
          </div>
        ) : (
          <div className="space-y-3">
            {noteRevisions.map((rev: Revision) => (
            <div
              key={rev.id}
              className="p-4 rounded-lg bg-white border border-neutral-200 hover:shadow-md transition-all hover:border-neutral-300"
            >
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="text-sm font-semibold text-neutral-900">
                      v{rev.version}
                    </div>
                    {rev.version === noteRevisions[0]?.version && (
                      <span className="text-xs badge badge-primary">Latest</span>
                    )}
                  </div>
                  <div className="text-xs text-neutral-500 mb-3">
                    {new Date(rev.createdAt).toLocaleDateString()} at {new Date(rev.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                  <div className="text-xs text-neutral-600 line-clamp-3 bg-neutral-50 p-2 rounded max-h-20 overflow-hidden">
                    {rev.blocks.length > 0
                      ? rev.blocks
                          .slice(0, 2)
                          .map((b) => b.content || "(empty block)")
                          .filter(c => c.trim())
                          .join(" • ")
                      : "(empty note)"}
                  </div>
                </div>
                <button
                  onClick={() => handleRestore(rev.id)}
                  disabled={restoring}
                  className="flex-shrink-0 px-3 py-1.5 text-xs font-medium bg-primary text-white rounded-md hover:bg-blue-600 disabled:bg-neutral-300 transition-all"
                  title="Restore this version"
                >
                  {restoring ? "⟳" : "↺"}
                </button>
              </div>
            </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
