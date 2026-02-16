const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const fetchNotes = async () => {
  const res = await fetch(`${API_BASE}/notes`);
  if (!res.ok) throw new Error("Failed to fetch notes");
  return res.json();
};

export const fetchNote = async (id: string) => {
  const res = await fetch(`${API_BASE}/notes/${id}`);
  if (!res.ok) throw new Error("Failed to fetch note");
  return res.json();
};

export const createNote = async (
  title: string,
  blocks: any[]
) => {
  const res = await fetch(`${API_BASE}/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, blocks }),
  });

  if (!res.ok) throw new Error("Failed to create note");
  return res.json();
};

export const updateNote = async (
  id: string,
  title: string,
  blocks: any[],
  version: number,
  updatedBy: string = "user"
) => {
  const res = await fetch(`${API_BASE}/notes/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, blocks, version, updatedBy }),
  });

  if (res.status === 409) {
    const conflict = await res.json();
    const error = new Error("CONFLICT") as any;
    error.status = 409;
    error.conflict = conflict;
    throw error;
  }

  if (!res.ok) throw new Error("Failed to update note");

  return res.json();
};

export const deleteNote = async (id: string) => {
  const res = await fetch(`${API_BASE}/notes/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete note");
  return res.json();
};

export const searchNotes = async (query: string) => {
  const res = await fetch(`${API_BASE}/notes/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("Failed to search notes");
  return res.json();
};

export const fetchRevisions = async (id: string) => {
  const res = await fetch(`${API_BASE}/notes/${id}/revisions`);
  if (!res.ok) throw new Error("Failed to fetch revisions");
  return res.json();
};

export const restoreRevision = async (revisionId: string) => {
  const res = await fetch(
    `${API_BASE}/revisions/${revisionId}/restore`,
    { method: "PATCH" }
  );
  if (!res.ok) throw new Error("Failed to restore revision");
  return res.json();
};
