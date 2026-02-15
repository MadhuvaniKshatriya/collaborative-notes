import { useDispatch, useSelector } from "react-redux";
import { useState, useMemo } from "react";
import type { RootState } from "../../app/store";
import {
  setActiveNote,
  addNote,
  renameNote,
  deleteNote,
} from "../../features/notes/notesSlice";
import { searchIndex } from "../../features/notes/notesSlice";

import SearchBar from "../search/SearchBar";

export default function NotesList() {
  const dispatch = useDispatch();

  const { notes, activeNoteId, searchQuery } = useSelector(
    (state: RootState) => state.notes
  );

  // 🔹 Editing state (must be outside map)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempTitle, setTempTitle] = useState("");

  /* ===============================
     Filter + Sort Notes
  =============================== */

  const filteredNotes = useMemo(() => {
    let noteArray = Object.values(notes);

    // 🔎 Apply indexed search
    if (searchQuery.trim()) {
      const matchedIds = searchIndex.search(searchQuery);
      noteArray = noteArray.filter((n) => matchedIds.includes(n.id));
    }

    // 🕒 Sort recent-first
    return noteArray.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() -
        new Date(a.updatedAt).getTime()
    );
  }, [notes, searchQuery]);

  /* ===============================
     Render
  =============================== */

  return (
    <div className="w-1/4 border-r bg-white p-4 flex flex-col h-full">
      {/* Header */}
      <h2 className="font-semibold text-lg mb-2">Notes</h2>

      {/* Search Bar */}
      <SearchBar />

      {/* New Note Button */}
      <button
        onClick={() => dispatch(addNote())}
        className="mb-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
      >
        + New Note
      </button>

      {/* Empty State */}
      {filteredNotes.length === 0 && (
        <div className="text-gray-400 text-sm">
          {searchQuery ? "No matching notes" : "No notes yet"}
        </div>
      )}

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto">
        {filteredNotes.map((note) => (
          <div
            key={note.id}
            className={`p-3 mb-2 rounded transition ${
              activeNoteId === note.id
                ? "bg-blue-100"
                : "hover:bg-gray-100"
            }`}
          >
            {editingId === note.id ? (
              <input
                className="w-full border px-2 py-1 text-sm rounded"
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                onBlur={() => {
                  dispatch(
                    renameNote({
                      id: note.id,
                      title: tempTitle.trim() || "Untitled Note",
                    })
                  );
                  setEditingId(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    dispatch(
                      renameNote({
                        id: note.id,
                        title: tempTitle.trim() || "Untitled Note",
                      })
                    );
                    setEditingId(null);
                  }
                }}
                autoFocus
              />
            ) : (
              <div className="flex justify-between items-center">
                <span
                  onClick={() =>
                    dispatch(setActiveNote(note.id))
                  }
                  className="cursor-pointer truncate font-medium"
                >
                  {note.title}
                </span>

                <div className="flex gap-2 text-xs">
                  <button
                    onClick={() => {
                      setEditingId(note.id);
                      setTempTitle(note.title);
                    }}
                    className="text-blue-600 hover:underline"
                  >
                    Rename
                  </button>

                  <button
                    onClick={() =>
                      dispatch(deleteNote(note.id))
                    }
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}

            {/* Version + Timestamp */}
            <div className="text-xs text-gray-500 mt-1">
              v{note.version} •{" "}
              {new Date(note.updatedAt).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
