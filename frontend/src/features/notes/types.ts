export interface Revision {
  id: string;
  noteId: string;
  content: string;
  version: number;
  editedBy: string;
  editedAt: string;
  restoredFrom?: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  version: number;
  updatedAt: string;
  updatedBy: string;
}

export interface SaveStatus {
  state: "idle" | "unsaved" | "saving" | "saved" | "error" | "conflict";
  message?: string;
}
