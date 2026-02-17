const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
});

export const fetchNotes = async (workspaceId: string) => {
  const res = await fetch(`${API_BASE}/workspaces/${workspaceId}/notes`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch notes");
  return res.json();
};

export const fetchNote = async (workspaceId: string, id: string) => {
  const res = await fetch(`${API_BASE}/workspaces/${workspaceId}/notes/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch note");
  return res.json();
};

export const createNote = async (
  workspaceId: string,
  title: string,
  blocks: any[]
) => {
  const res = await fetch(`${API_BASE}/workspaces/${workspaceId}/notes`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ title, blocks }),
  });

  if (!res.ok) throw new Error("Failed to create note");
  return res.json();
};

export const updateNote = async (
  workspaceId: string,
  id: string,
  title: string,
  blocks: any[],
  version: number,
  updatedBy: string = "user"
) => {
  const res = await fetch(`${API_BASE}/workspaces/${workspaceId}/notes/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
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

export const deleteNote = async (workspaceId: string, id: string) => {
  const res = await fetch(`${API_BASE}/workspaces/${workspaceId}/notes/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete note");
  return res.json();
};

export const searchNotes = async (workspaceId: string, query: string) => {
  const res = await fetch(`${API_BASE}/workspaces/${workspaceId}/notes/search?q=${encodeURIComponent(query)}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to search notes");
  return res.json();
};

export const fetchRevisions = async (workspaceId: string, id: string) => {
  const res = await fetch(`${API_BASE}/workspaces/${workspaceId}/notes/${id}/revisions`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch revisions");
  return res.json();
};

export const restoreRevision = async (
  workspaceId: string,
  noteId: string,
  revisionId: string
) => {
  const res = await fetch(
    `${API_BASE}/workspaces/${workspaceId}/notes/${noteId}/revisions/${revisionId}/restore`,
    {
      method: "POST",
      headers: getAuthHeaders(),
    }
  );
  if (!res.ok) throw new Error("Failed to restore revision");
  return res.json();
};

export const createShareLink = async (workspaceId: string, noteId: string) => {
  const res = await fetch(
    `${API_BASE}/workspaces/${workspaceId}/notes/${noteId}/share`,
    {
      method: "POST",
      headers: getAuthHeaders(),
    }
  );
  if (!res.ok) throw new Error("Failed to create share link");
  return res.json();
};

export const getSharedNote = async (shareToken: string) => {
  const res = await fetch(`${API_BASE}/share/${shareToken}`);
  if (!res.ok) throw new Error("Failed to fetch shared note");
  return res.json();
};
