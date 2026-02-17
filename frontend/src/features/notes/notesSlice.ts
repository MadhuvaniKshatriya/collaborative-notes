import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { SearchIndex } from "./searchIndex";
import type { Block, BlockType } from "./types";



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

interface ConflictData {
  localBlocks: Block[];
  remoteBlocks: Block[];
  remoteVersion: number;
  lastEditedBy?: string;
  lastEditedAt?: string;
}

interface NotesState {
  notes: Record<string, Note>;
  activeNoteId: string | null;
  localBlocks: Block[];
  version: number;
  saveStatus: SaveStatus;

  conflictData?: ConflictData;
  searchQuery: string;
  lastCreatedBlockId?: string;
}


const searchIndex = new SearchIndex();


const initialState: NotesState = {
  notes: {},
  activeNoteId: null,
  localBlocks: [],
  version: 1,
  saveStatus: { state: "idle" },
  searchQuery: "",
  lastCreatedBlockId: undefined,
};


function flattenBlocks(blocks: Block[]) {
  return blocks.map((b) => b.content).join(" ");
}


const notesSlice = createSlice({
  name: "notes",
  initialState,
  reducers: {
    hydrateNoteFromServer(state, action: PayloadAction<Note>) {
      const note = action.payload;

      state.notes[note.id] = note;

      searchIndex.removeNote(note.id);
      searchIndex.addNote(
        note.id,
        note.title + " " + flattenBlocks(note.blocks)
      );

      if (state.activeNoteId === note.id) {
        state.localBlocks = note.blocks.map((b) => ({ ...b }));
        state.version = note.version;
      }
    },

    hydrateMultipleNotes(state, action: PayloadAction<Note[]>) {
      const notes = action.payload;
      notes.forEach((note) => {
        state.notes[note.id] = note;
        searchIndex.addNote(
          note.id,
          note.title + " " + flattenBlocks(note.blocks)
        );
      });
    },

    deleteNote(state, action: PayloadAction<string>) {
      const id = action.payload;

      searchIndex.removeNote(id);
      delete state.notes[id];

      if (state.activeNoteId === id) {
        state.activeNoteId = null;
        state.localBlocks = [];
        state.saveStatus = { state: "idle" };
      }
    },

    setActiveNote(state, action: PayloadAction<string>) {
      const id = action.payload;
      const note = state.notes[id];
      if (!note) return;

      state.activeNoteId = id;
      state.localBlocks = note.blocks.map((b) => ({ ...b }));
      state.version = note.version;
      state.saveStatus = { state: "idle" };
      state.conflictData = undefined;
    },

    renameNote(
      state,
      action: PayloadAction<{ id: string; title: string }>
    ) {
      const { id, title } = action.payload;
      const note = state.notes[id];
      if (!note) return;

      searchIndex.removeNote(id);

      note.title = title;
      note.updatedAt = new Date().toISOString();

      searchIndex.addNote(
        id,
        title + " " + flattenBlocks(note.blocks)
      );

      if (state.activeNoteId === id) {
        state.saveStatus = { state: "unsaved" };
      }
    },

    updateBlock(
      state,
      action: PayloadAction<{ blockId: string; content: string }>
    ) {
      const block = state.localBlocks.find(
        (b) => b.id === action.payload.blockId
      );
      if (!block) return;

      block.content = action.payload.content;
      state.saveStatus = { state: "unsaved" };
    },

    addBlock(
      state,
      action: PayloadAction<{ afterId: string; type?: BlockType }>
    ) {
      const index = state.localBlocks.findIndex(
        (b) => b.id === action.payload.afterId
      );

      if (index === -1) return;

      const newBlock = {
        id: crypto.randomUUID(),
        type: action.payload.type || "paragraph",
        content: "",
      };

      state.localBlocks.splice(index + 1, 0, newBlock);
      state.lastCreatedBlockId = newBlock.id;
      state.saveStatus = { state: "unsaved" };
    },

    changeBlockType(
      state,
      action: PayloadAction<{ blockId: string; type: BlockType }>
    ) {
      const block = state.localBlocks.find(
        (b) => b.id === action.payload.blockId
      );
      if (!block) return;

      block.type = action.payload.type;
      block.content = "";
      state.saveStatus = { state: "unsaved" };
    },

    toggleCheckbox(
      state,
      action: PayloadAction<{ blockId: string }>
    ) {
      const block = state.localBlocks.find(
        (b) => b.id === action.payload.blockId
      );
      if (!block) return;

      block.checked = !block.checked;
      state.saveStatus = { state: "unsaved" };
    },

    clearLastCreatedBlock(state) {
      state.lastCreatedBlockId = undefined;
    },

    startSaving(state) {
      state.saveStatus = { state: "saving" };
    },

    saveSuccess(
      state,
      action: PayloadAction<{ version: number }>
    ) {
      if (!state.activeNoteId) return;

      const note = state.notes[state.activeNoteId];
      if (!note) return;

      note.blocks = state.localBlocks.map((b) => ({ ...b }));
      note.version = action.payload.version;
      note.updatedAt = new Date().toISOString();

      state.version = action.payload.version;
      state.saveStatus = { state: "saved" };
    },

    saveError(state) {
      state.saveStatus = {
        state: "error",
        message: "Failed to save",
      };
    },

    setConflict(
      state,
      action: PayloadAction<{
        remoteBlocks: Block[];
        remoteVersion: number;
        lastEditedBy?: string;
        lastEditedAt?: string;
      }>
    ) {
      state.saveStatus = { state: "conflict" };
      state.conflictData = {
        localBlocks: state.localBlocks.map((b) => ({ ...b })),
        remoteBlocks: action.payload.remoteBlocks,
        remoteVersion: action.payload.remoteVersion,
        lastEditedBy: action.payload.lastEditedBy,
        lastEditedAt: action.payload.lastEditedAt,
      };
    },

    resolveConflictWithRemote(state) {
      if (!state.activeNoteId || !state.conflictData) return;

      const note = state.notes[state.activeNoteId];

      note.blocks = state.conflictData.remoteBlocks.map((b) => ({
        ...b,
      }));
      note.version = state.conflictData.remoteVersion;

      state.localBlocks = note.blocks.map((b) => ({ ...b }));
      state.version = note.version;

      state.saveStatus = { state: "saved" };
      state.conflictData = undefined;
    },

    resolveConflictWithLocal(state) {
      if (!state.conflictData) return;

      state.localBlocks = state.conflictData.localBlocks.map(
        (b) => ({ ...b })
      );
      state.saveStatus = { state: "unsaved" };
      state.conflictData = undefined;
    },

    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
  },
});


export const {
  hydrateNoteFromServer,
  hydrateMultipleNotes,
  deleteNote,
  renameNote,
  setActiveNote,
  updateBlock,
  addBlock,
  changeBlockType,
  toggleCheckbox,
  clearLastCreatedBlock,
  startSaving,
  saveSuccess,
  saveError,
  setConflict,
  resolveConflictWithRemote,
  resolveConflictWithLocal,
  setSearchQuery,
} = notesSlice.actions;

export default notesSlice.reducer;

export { searchIndex };
