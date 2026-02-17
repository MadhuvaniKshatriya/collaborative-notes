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

  const localContent = conflictData.localBlocks
    .map((b) => b.content)
    .join("\n")
    .trim();

  const remoteContent = conflictData.remoteBlocks
    .map((b) => b.content)
    .join("\n")
    .trim();

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString([], {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-6xl rounded-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">⚠️</span>
            <h2 className="text-2xl font-bold">Conflict Detected</h2>
          </div>
          <p className="text-orange-100">
            Your changes conflict with recent changes made by another user. Please review both versions and choose which one to keep.
          </p>
        </div>

        {/* Context Info */}
        <div className="bg-orange-50 border-b border-orange-200 px-6 py-4">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-semibold text-neutral-600 mb-1">Your Changes</p>
              <p className="text-xs text-neutral-500">
                You're trying to save your local edits (v{conflictData.remoteVersion})
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-600 mb-1">Remote Changes</p>
              <p className="text-xs text-neutral-500">
                Changed by <span className="font-medium text-neutral-700">{conflictData.lastEditedBy || 'Someone'}</span> on {formatDate(conflictData.lastEditedAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Content Comparison */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Local Version */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <h3 className="font-semibold text-neutral-900">Your Version</h3>
              </div>
              <div className="flex-1 border border-blue-200 rounded-lg bg-blue-50 p-4 font-mono text-sm overflow-hidden flex flex-col">
                {localContent ? (
                  <pre className="whitespace-pre-wrap break-words text-neutral-700 overflow-hidden">
                    {localContent}
                  </pre>
                ) : (
                  <span className="text-neutral-400 italic">(empty)</span>
                )}
              </div>
              <div className="mt-2 text-xs text-neutral-500">
                {conflictData.localBlocks.length} block{conflictData.localBlocks.length !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Remote Version */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <h3 className="font-semibold text-neutral-900">Remote Version</h3>
              </div>
              <div className="flex-1 border border-green-200 rounded-lg bg-green-50 p-4 font-mono text-sm overflow-hidden flex flex-col">
                {remoteContent ? (
                  <pre className="whitespace-pre-wrap break-words text-neutral-700 overflow-hidden">
                    {remoteContent}
                  </pre>
                ) : (
                  <span className="text-neutral-400 italic">(empty)</span>
                )}
              </div>
              <div className="mt-2 text-xs text-neutral-500">
                {conflictData.remoteBlocks.length} block{conflictData.remoteBlocks.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-neutral-50 border-t border-neutral-200 px-6 py-4 flex justify-between items-center gap-4">
          <p className="text-sm text-neutral-600">
            Which version would you like to keep? Either choice will be saved as a new revision.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => dispatch(resolveConflictWithLocal())}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm"
              title="Keep your changes"
            >
              ✎ Keep Mine
            </button>

            <button
              onClick={() => dispatch(resolveConflictWithRemote())}
              className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors shadow-sm"
              title="Accept the remote changes"
            >
              ↓ Use Remote
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
