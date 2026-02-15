export interface Revision {
  id: string;
  noteId: string;
  content: string;
  version: number;
  editedBy: string;
  editedAt: string;
  restoredFrom?: number;
}

export type BlockType =
  | "paragraph"
  | "heading"
  | "bullet"
  | "checkbox"
  | "code";

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  checked?: boolean;
}

export interface Note {
  id: string;
  title: string;
  blocks: Block[];
  version: number;
  updatedAt: string;
  updatedBy: string;
}


export interface SaveStatus {
  state: "idle" | "unsaved" | "saving" | "saved" | "error" | "conflict";
  message?: string;
}
