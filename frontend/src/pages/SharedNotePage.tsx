import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

interface SharedNote {
  id: string;
  title: string;
  blocks: Array<{
    id: string;
    type: string;
    content: string;
    createdByUser: { username: string; avatar: string };
  }>;
  createdByUser: { username: string };
  createdAt: string;
}

export default function SharedNotePage() {
  const { token } = useParams<{ token: string }>();
  const [note, setNote] = useState<SharedNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSharedNote = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/share/${token}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError("Shared note not found or has expired");
          } else {
            setError("Failed to load shared note");
          }
          return;
        }

        const data = await response.json();
        setNote(data);
        setError(null);
      } catch (err) {
        setError("Failed to load shared note");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchSharedNote();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-50">
        <div className="text-center">
          <div className="text-6xl mb-4">📝</div>
          <div className="text-neutral-600">Loading shared note...</div>
        </div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-50">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <div className="text-xl font-semibold text-neutral-900 mb-2">
            {error || "Note not found"}
          </div>
          <div className="text-neutral-600">
            The note you're looking for doesn't exist or has expired.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-neutral-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-10 py-6 border-b border-neutral-200">
          <h1 className="text-4xl font-bold text-neutral-900">
            {note.title}
          </h1>
          <div className="text-sm text-neutral-500 mt-2">
            Shared by{" "}
            <span className="font-medium text-neutral-700">
              {note.createdByUser?.username || "Unknown"}
            </span>{" "}
            • Created{" "}
            {new Date(note.createdAt).toLocaleDateString()}
          </div>
        </div>

        <div className="px-10 py-3 bg-neutral-50 text-xs text-neutral-600">
          This is a read-only shared view of a note
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-10 py-8">
        {note.blocks && note.blocks.length > 0 ? (
          <div className="space-y-4">
            {note.blocks.map((block) => (
              <div key={block.id}>
                {block.type === "HEADING" && (
                  <h2 className="text-2xl font-bold text-neutral-900">
                    {block.content}
                  </h2>
                )}
                {block.type === "PARAGRAPH" && (
                  <p className="text-base text-neutral-700 whitespace-pre-wrap">
                    {block.content}
                  </p>
                )}
                {block.type === "CHECKLIST" && (
                  <div className="flex items-center gap-3 text-neutral-700">
                    <input
                      type="checkbox"
                      disabled
                      checked={false}
                      className="w-4 h-4"
                    />
                    <span>{block.content}</span>
                  </div>
                )}
                {block.type === "QUOTE" && (
                  <blockquote className="border-l-4 border-neutral-300 pl-4 italic text-neutral-700">
                    {block.content}
                  </blockquote>
                )}
                {block.type === "CODE" && (
                  <pre className="bg-neutral-100 p-4 rounded-lg overflow-x-auto">
                    <code className="text-sm font-mono text-neutral-800">
                      {block.content}
                    </code>
                  </pre>
                )}
                {!["HEADING", "PARAGRAPH", "CHECKLIST", "QUOTE", "CODE"].includes(
                  block.type
                ) && (
                  <p className="text-base text-neutral-700 whitespace-pre-wrap">
                    {block.content}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-neutral-500">This note is empty</div>
          </div>
        )}
      </div>
    </div>
  );
}
