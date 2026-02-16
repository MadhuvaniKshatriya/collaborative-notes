export interface Revision {
  id: string;
  noteId: string;
  blocks: Block[];
  version: number;
  createdAt: string;
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
