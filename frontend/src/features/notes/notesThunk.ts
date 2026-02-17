import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  createNote,
  fetchNotes,
  restoreRevision,
  searchNotes,
} from "./notesApi";
import {
  hydrateNoteFromServer,
  setActiveNote,
  hydrateMultipleNotes,
} from "./notesSlice";
import type { RootState } from "../../app/store";

export const initializeNotesThunk = createAsyncThunk<
  any[],
  string
>(
  "notes/initialize",
  async (workspaceId: string, { dispatch }) => {
    const notes = await fetchNotes(workspaceId);
    dispatch(hydrateMultipleNotes(notes));
    return notes;
  }
);

export const createNoteThunk = createAsyncThunk<
  any,
  void,
  { state: RootState }
>(
  "notes/createNote",
  async (_, { dispatch, getState }) => {
    const state = getState();
    const workspaceId = state.workspace.currentWorkspaceId;

    if (!workspaceId) {
      throw new Error("No workspace selected");
    }

    // Use a simple UUID v4 generation
    const generateUUID = () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    };

    const newNote = await createNote(workspaceId, "Untitled Note", [
      {
        id: generateUUID(),
        type: "PARAGRAPH",
        content: "",
      },
    ]);

    dispatch(hydrateNoteFromServer(newNote));
    dispatch(setActiveNote(newNote.id));

    return newNote;
  }
);

export const restoreRevisionThunk = createAsyncThunk<
  any,
  string,
  { state: RootState }
>(
  "notes/restoreRevision",
  async (revisionId: string, { dispatch, getState }) => {
    const state = getState();
    const workspaceId = state.workspace.currentWorkspaceId;
    const noteId = state.notes.activeNoteId;

    if (!workspaceId || !noteId) {
      throw new Error("Missing workspace or note ID");
    }

    const restoredNote = await restoreRevision(
      workspaceId,
      noteId,
      revisionId
    );
    dispatch(hydrateNoteFromServer(restoredNote));
    dispatch(setActiveNote(restoredNote.id));
    return restoredNote;
  }
);

export const searchNotesThunk = createAsyncThunk<
  any[],
  string,
  { state: RootState }
>(
  "notes/search",
  async (query: string, { getState }) => {
    const state = getState();
    const workspaceId = state.workspace.currentWorkspaceId;

    if (!workspaceId) {
      throw new Error("No workspace selected");
    }

    if (!query.trim()) {
      return [];
    }
    return searchNotes(workspaceId, query);
  }
);

