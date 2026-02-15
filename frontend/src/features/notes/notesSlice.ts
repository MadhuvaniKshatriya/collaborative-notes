import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { SearchIndex } from "./searchIndex";

/* ============================
   Types
============================ */

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

interface ConflictData {
  localContent: string;
  remoteContent: string;
  remoteVersion: number;
}

interface NotesState {
  notes: Record<string, Note>;
  activeNoteId: string | null;
  localContent: string;
  saveStatus: SaveStatus;

  // request sequencing safety
  requestSequence: number;
  lastCommittedSequence: number;

  // conflict state
  conflictData?: ConflictData;

  // search
  searchQuery: string;

  revisions: Record<string, Revision[]>;
}

interface Revision {
  id: string;
  noteId: string;
  content: string;
  version: number;
  editedAt: string;
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
  localContent: "",
  saveStatus: { state: "idle" },
  requestSequence: 0,
  lastCommittedSequence: 0,
  searchQuery: "",
  revisions:{},
};

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
        content: "",
        version: 1,
        updatedAt: now,
        updatedBy: "You",
      };

      state.notes[id] = newNote;
      state.activeNoteId = id;
      state.localContent = "";

      searchIndex.addNote(id, "");
    },

    /* ======================
       Delete Note
    ====================== */
    deleteNote(state, action: PayloadAction<string>) {
      const id = action.payload;

      searchIndex.removeNote(id);
      delete state.notes[id];

      if (state.activeNoteId === id) {
        state.activeNoteId = null;
        state.localContent = "";
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

      // remove old index entries
      searchIndex.removeNote(id);

      note.title = title;
      note.updatedAt = new Date().toISOString();

      // reindex
      searchIndex.addNote(id, title + " " + note.content);

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
      state.localContent = state.notes[id]?.content || "";
      state.saveStatus = { state: "idle" };
      state.conflictData = undefined;
    },

    /* ======================
       Update Local Content
    ====================== */
    updateLocalContent(state, action: PayloadAction<string>) {
      state.localContent = action.payload;
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
        content: string;
        version: number;
        seq: number;
      }>
    ) {
      const { content, version, seq } = action.payload;

      // stale response protection
      if (seq < state.lastCommittedSequence) return;

      state.lastCommittedSequence = seq;

      if (!state.activeNoteId) return;
      const note = state.notes[state.activeNoteId];
      if (!note) return;

      // remove old index entries
      searchIndex.removeNote(note.id);

      note.content = content;
      note.version = version;
      note.updatedAt = new Date().toISOString();

      // reindex with new content
      searchIndex.addNote(
        note.id,
        note.title + " " + content
      );
      if (!state.revisions[note.id]) {
  state.revisions[note.id] = [];
}

const revisions = state.revisions[note.id] || [];
const lastRevision = revisions[revisions.length - 1];

if (!lastRevision || lastRevision.content !== content) {
  if (!state.revisions[note.id]) {
    state.revisions[note.id] = [];
  }

  state.revisions[note.id].push({
    id: crypto.randomUUID(),
    noteId: note.id,
    content,
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
        remoteContent: string;
        remoteVersion: number;
      }>
    ) {
      state.saveStatus = { state: "conflict" };
      state.conflictData = {
        localContent: state.localContent,
        remoteContent: action.payload.remoteContent,
        remoteVersion: action.payload.remoteVersion,
      };
    },

    resolveConflictWithLocal(state) {
      if (!state.activeNoteId || !state.conflictData) return;

      state.localContent = state.conflictData.localContent;
      state.saveStatus = { state: "unsaved" };
      state.conflictData = undefined;
    },

    resolveConflictWithRemote(state) {
      if (!state.activeNoteId || !state.conflictData) return;

      const note = state.notes[state.activeNoteId];

      searchIndex.removeNote(note.id);

      note.content = state.conflictData.remoteContent;
      note.version = state.conflictData.remoteVersion;

      searchIndex.addNote(
        note.id,
        note.title + " " + note.content
      );

      state.localContent = note.content;
      state.saveStatus = { state: "saved" };
      state.conflictData = undefined;
    },

    /* ======================
       Search
    ====================== */
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
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
  updateLocalContent,
  startSaving,
  saveSuccess,
  saveError,
  setConflict,
  resolveConflictWithLocal,
  resolveConflictWithRemote,
  setSearchQuery,
} = notesSlice.actions;

export default notesSlice.reducer;

/* ============================
   Optional Export (for selector usage)
============================ */

export { searchIndex };
