import { useDispatch, useSelector } from "react-redux";
import { useState, useMemo } from "react";
import type { RootState } from "../../app/store";
import {
  setActiveNote,
  renameNote,
  deleteNote,
} from "../../features/notes/notesSlice";
import { searchIndex } from "../../features/notes/notesSlice";

export default function NotesList() {
  const dispatch = useDispatch();

  const { notes, activeNoteId, searchQuery } = useSelector(
    (state: RootState) => state.notes
  );

  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempTitle, setTempTitle] = useState("");


  const filteredNotes = useMemo(() => {
    let noteArray = Object.values(notes);

    // 🔎 Apply indexed search
    if (searchQuery.trim()) {
      const matchedIds = searchIndex.search(searchQuery);
      noteArray = noteArray.filter((n) => matchedIds.includes(n.id));
    }

    return noteArray.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() -
        new Date(a.updatedAt).getTime()
    );
  }, [notes, searchQuery]);


  return (
    <div className="flex-1 overflow-y-auto space-y-2">
      {/* Empty State */}
      {filteredNotes.length === 0 && (
        <div className="text-slate-400 text-sm italic py-8 text-center">
          {searchQuery ? "📭 No matching notes" : "📚 No notes yet"}
        </div>
      )}

      {/* Notes List */}
      <div className="flex flex-col gap-2">
          {filteredNotes.map((note) => (
          <div
            key={note.id}
            className={`p-4 rounded-lg transition-all ${
              activeNoteId === note.id
                ? "bg-blue-500 text-white shadow-md scale-105 origin-left"
                : "bg-white hover:bg-slate-50 hover:shadow-md text-slate-800 border border-slate-200"
            }`}
          >
            {editingId === note.id ? (
              <input
                className="w-full border border-slate-300 px-3 py-2 text-sm rounded-lg bg-white text-slate-800"
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
              <div className="flex justify-between items-start gap-2">
                <span
                  onClick={() =>
                    dispatch(setActiveNote(note.id))
                  }
                  className="cursor-pointer truncate font-semibold flex-1 hover:underline"
                >
                  {note.title}
                </span>

                <div className="flex gap-1 text-xs flex-shrink-0">
                  <button
                    onClick={() => {
                      setEditingId(note.id);
                      setTempTitle(note.title);
                    }}
                    className={`px-2 py-1 rounded transition-all ${
                      activeNoteId === note.id
                        ? "bg-blue-400 hover:bg-blue-300"
                        : "text-blue-600 hover:bg-blue-100"
                    }`}
                  >
                    ✏️
                  </button>

                  <button
                    onClick={() =>
                      dispatch(deleteNote(note.id))
                    }
                    className={`px-2 py-1 rounded transition-all ${
                      activeNoteId === note.id
                        ? "bg-red-400 hover:bg-red-300"
                        : "text-red-600 hover:bg-red-100"
                    }`}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            )}

            {/* Version + Timestamp */}
            <div className={`text-xs mt-2 ${
              activeNoteId === note.id
                ? "text-blue-100"
                : "text-slate-400"
            }`}>
              v{note.version} • {new Date(note.updatedAt).toLocaleDateString()} {new Date(note.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
