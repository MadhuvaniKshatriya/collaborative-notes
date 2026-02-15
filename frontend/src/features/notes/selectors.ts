import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../../app/store";
import { searchIndex } from "./notesSlice";

export const selectNotesState = (state: RootState) => state.notes;

export const selectFilteredNotes = createSelector(
  [selectNotesState],
  ({ notes, searchQuery }) => {
    let noteArray = Object.values(notes);

    if (searchQuery.trim()) {
      const matchedIds = searchIndex.search(searchQuery);
      noteArray = noteArray.filter((n) =>
        matchedIds.includes(n.id)
      );
    }

    return [...noteArray].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() -
        new Date(a.updatedAt).getTime()
    );
  }
);
