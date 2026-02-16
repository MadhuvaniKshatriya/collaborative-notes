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
    <div className="h-full flex flex-col bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="p-6 border-b border-slate-200 bg-white shadow-sm">
        <h2 className="font-bold text-lg text-slate-800">
          ⏰ Revision History
        </h2>
        <p className="text-xs text-slate-400 mt-1">View and restore versions</p>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {!activeNoteId ? (
          <div className="text-sm text-slate-400 italic text-center py-8">
            📭 Select a note to view revisions
          </div>
        ) : loading ? (
          <div className="text-sm text-slate-400 italic text-center py-8">
            ⏳ Loading revisions...
          </div>
        ) : noteRevisions.length === 0 ? (
          <div className="text-sm text-slate-400 italic text-center py-8">
            📚 No revisions yet
          </div>
        ) : (
          <div className="space-y-3">
            {noteRevisions.map((rev: Revision) => (
            <div
              key={rev.id}
              className="p-4 rounded-lg bg-white hover:shadow-md transition-all border border-slate-200 hover:border-blue-300"
            >
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-800">
                    Version {rev.version}
                  </div>
                  <div className="text-slate-400 text-xs mt-1">
                    📅 {new Date(rev.createdAt).toLocaleDateString()} {new Date(rev.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                  <div className="text-slate-600 text-xs mt-3 max-h-20 overflow-hidden bg-slate-50 p-2 rounded line-clamp-3">
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
                  className="flex-shrink-0 px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-md disabled:from-slate-400 disabled:to-slate-400 transition-all"
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
