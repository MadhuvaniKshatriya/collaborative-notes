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

export const initializeNotesThunk = createAsyncThunk(
  "notes/initialize",
  async (_, { dispatch }) => {
    const notes = await fetchNotes();
    dispatch(hydrateMultipleNotes(notes));
    return notes;
  }
);

export const createNoteThunk = createAsyncThunk(
  "notes/createNote",
  async (_, { dispatch }) => {
    const newNote = await createNote("Untitled Note", [
      {
        id: crypto.randomUUID(),
        type: "paragraph",
        content: "",
      },
    ]);

    dispatch(hydrateNoteFromServer(newNote));
    dispatch(setActiveNote(newNote.id));

    return newNote;
  }
);

export const restoreRevisionThunk = createAsyncThunk(
  "notes/restoreRevision",
  async (revisionId: string, { dispatch }) => {
    const restoredNote = await restoreRevision(revisionId);
    dispatch(hydrateNoteFromServer(restoredNote));
    dispatch(setActiveNote(restoredNote.id));
    return restoredNote;
  }
);

export const searchNotesThunk = createAsyncThunk(
  "notes/search",
  async (query: string) => {
    if (!query.trim()) {
      return [];
    }
    return searchNotes(query);
  }
);
