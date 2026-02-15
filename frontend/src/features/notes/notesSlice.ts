import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { SearchIndex } from "./searchIndex";
import type { Block, BlockType } from "./types";

/* ============================
   Types
============================ */

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
}

interface Revision {
  id: string;
  noteId: string;
  blocks: Block[];
  version: number;
  editedAt: string;
}

interface NotesState {
  notes: Record<string, Note>;
  activeNoteId: string | null;
  localBlocks: Block[];
  saveStatus: SaveStatus;

  requestSequence: number;
  lastCommittedSequence: number;

  conflictData?: ConflictData;

  searchQuery: string;

  revisions: Record<string, Revision[]>;
  lastCreatedBlockId?: string;

}

/* ============================
   Search Index Instance
============================ */

const searchIndex = new SearchIndex();

/* ============================
   Initial State
============================ */

const initialState: NotesState = {
  notes: {},
  activeNoteId: null,
  localBlocks: [],
  saveStatus: { state: "idle" },
  requestSequence: 0,
  lastCommittedSequence: 0,
  searchQuery: "",
  revisions: {},
  lastCreatedBlockId: undefined,

};

/* ============================
   Helper
============================ */

function flattenBlocks(blocks: Block[]) {
  return blocks.map((b) => b.content).join(" ");
}

/* ============================
   Slice
============================ */

const notesSlice = createSlice({
  name: "notes",
  initialState,
  reducers: {
    /* ======================
       Create Note
    ====================== */
    addNote(state) {
      const id = crypto.randomUUID();
      const now = new Date().toISOString();

      const newNote: Note = {
        id,
        title: "Untitled Note",
        blocks: [
          {
            id: crypto.randomUUID(),
            type: "paragraph",
            content: "",
          },
        ],
        version: 1,
        updatedAt: now,
        updatedBy: "You",
      };

      state.notes[id] = newNote;
      state.revisions[id] = [];
      state.activeNoteId = id;
      state.localBlocks = newNote.blocks.map((b) => ({ ...b }));

      searchIndex.addNote(id, "");
    },

    /* ======================
       Delete Note
    ====================== */
    deleteNote(state, action: PayloadAction<string>) {
      const id = action.payload;

      searchIndex.removeNote(id);
      delete state.notes[id];
      delete state.revisions[id];

      if (state.activeNoteId === id) {
        state.activeNoteId = null;
        state.localBlocks = [];
        state.saveStatus = { state: "idle" };
      }
    },

    /* ======================
       Rename Note
    ====================== */
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

      searchIndex.addNote(id, title + " " + flattenBlocks(note.blocks));

      if (state.activeNoteId === id) {
        state.saveStatus = { state: "unsaved" };
      }
    },

    /* ======================
       Set Active Note
    ====================== */
    setActiveNote(state, action: PayloadAction<string>) {
      const id = action.payload;
      state.activeNoteId = id;
      state.localBlocks =
        state.notes[id]?.blocks.map((b) => ({ ...b })) || [];
      state.saveStatus = { state: "idle" };
      state.conflictData = undefined;
    },

    /* ======================
       Block Editing
    ====================== */
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


    /* ======================
       Saving Lifecycle
    ====================== */
    startSaving(state) {
      state.saveStatus = { state: "saving" };
      state.requestSequence += 1;
    },

    saveSuccess(
      state,
      action: PayloadAction<{
        version: number;
        seq: number;
      }>
    ) {
      const { version, seq } = action.payload;

      if (seq < state.lastCommittedSequence) return;
      state.lastCommittedSequence = seq;

      if (!state.activeNoteId) return;
      const note = state.notes[state.activeNoteId];
      if (!note) return;

      searchIndex.removeNote(note.id);

      note.blocks = state.localBlocks.map((b) => ({ ...b }));
      note.version = version;
      note.updatedAt = new Date().toISOString();

      searchIndex.addNote(
        note.id,
        note.title + " " + flattenBlocks(note.blocks)
      );

      const revisions = state.revisions[note.id] || [];
      const lastRevision = revisions[revisions.length - 1];

      if (
        !lastRevision ||
        JSON.stringify(lastRevision.blocks) !==
          JSON.stringify(note.blocks)
      ) {
        state.revisions[note.id].push({
          id: crypto.randomUUID(),
          noteId: note.id,
          blocks: note.blocks.map((b) => ({ ...b })),
          version,
          editedAt: new Date().toISOString(),
        });
      }

      state.saveStatus = { state: "saved" };
    },

    saveError(state) {
      state.saveStatus = {
        state: "error",
        message: "Failed to save",
      };
    },

    /* ======================
       Conflict Handling
    ====================== */
    setConflict(
      state,
      action: PayloadAction<{
        remoteBlocks: Block[];
        remoteVersion: number;
      }>
    ) {
      state.saveStatus = { state: "conflict" };
      state.conflictData = {
        localBlocks: state.localBlocks.map((b) => ({ ...b })),
        remoteBlocks: action.payload.remoteBlocks,
        remoteVersion: action.payload.remoteVersion,
      };
    },

    resolveConflictWithLocal(state) {
      if (!state.conflictData) return;
      state.localBlocks = state.conflictData.localBlocks.map((b) => ({
        ...b,
      }));
      state.saveStatus = { state: "unsaved" };
      state.conflictData = undefined;
    },

    resolveConflictWithRemote(state) {
      if (!state.activeNoteId || !state.conflictData) return;

      const note = state.notes[state.activeNoteId];

      searchIndex.removeNote(note.id);

      note.blocks = state.conflictData.remoteBlocks.map((b) => ({
        ...b,
      }));
      note.version = state.conflictData.remoteVersion;

      state.localBlocks = note.blocks.map((b) => ({ ...b }));

      searchIndex.addNote(
        note.id,
        note.title + " " + flattenBlocks(note.blocks)
      );

      state.saveStatus = { state: "saved" };
      state.conflictData = undefined;
    },

    /* ======================
       Search
    ====================== */
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
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
  block.content = ""; // reset slash content
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



  },
});

/* ============================
   Exports
============================ */

export const {
  addNote,
  deleteNote,
  renameNote,
  setActiveNote,
  updateBlock,
  addBlock,
  startSaving,
  saveSuccess,
  saveError,
  setConflict,
  resolveConflictWithLocal,
  resolveConflictWithRemote,
  setSearchQuery,
  changeBlockType,
  toggleCheckbox,
  clearLastCreatedBlock,
} = notesSlice.actions;

export default notesSlice.reducer;

export { searchIndex };
