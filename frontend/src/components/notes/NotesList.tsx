import { useDispatch, useSelector } from "react-redux";
import { useState, useMemo } from "react";
import type { RootState } from "../../app/store";
import {
  setActiveNote,
  renameNote,
  deleteNote,
} from "../../features/notes/notesSlice";
import { searchIndex } from "../../features/notes/notesSlice";
import HighlightedText from "../common/HighlightedText";

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
        <div className="text-neutral-400 text-sm italic py-8 text-center">
          {searchQuery ? "No matching notes found" : "Create your first note to get started"}
        </div>
      )}

      {/* Notes List */}
      <div className="flex flex-col gap-2">
          {filteredNotes.map((note) => (
          <div
            key={note.id}
            className={`p-4 rounded-lg border transition-all cursor-pointer ${
              activeNoteId === note.id
                ? "bg-primary-light border-primary shadow-md"
                : "bg-white border-neutral-200 hover:border-neutral-300 hover:shadow-sm"
            }`}
          >
            {editingId === note.id ? (
              <input
                className="w-full border border-neutral-300 px-3 py-2 text-sm rounded-md bg-white text-neutral-900 font-medium"
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
              <>
                <div className="flex justify-between items-start gap-2 mb-2">
                  <span
                    onClick={() =>
                      dispatch(setActiveNote(note.id))
                    }
                    className={`font-semibold flex-1 truncate ${
                      activeNoteId === note.id
                        ? "text-primary-dark"
                        : "text-neutral-900"
                    }`}
                  >
                    {searchQuery ? (
                      <HighlightedText text={note.title} searchQuery={searchQuery} />
                    ) : (
                      note.title
                    )}
                  </span>

                  <div className="flex gap-1 flex-shrink-0 opacity-0 hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setEditingId(note.id);
                        setTempTitle(note.title);
                      }}
                      className="p-1.5 text-neutral-500 hover:text-primary rounded transition-colors"
                      title="Rename"
                    >
                      ✏️
                    </button>

                    <button
                      onClick={() =>
                        dispatch(deleteNote(note.id))
                      }
                      className="p-1.5 text-neutral-500 hover:text-red-600 rounded transition-colors"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Preview Snippet */}
                <div className="text-xs text-neutral-500 mb-3 line-clamp-2">
                  {note.blocks && note.blocks.length > 0
                    ? (() => {
                        const preview = note.blocks
                          .map((b: any) => b.content)
                          .filter((c: string) => c?.trim())
                          .join(" • ");
                        return searchQuery ? (
                          <HighlightedText text={preview} searchQuery={searchQuery} />
                        ) : (
                          preview
                        );
                      })()
                    : "No content yet"}
                </div>

                {/* Metadata */}
                <div className={`text-xs flex justify-between ${
                  activeNoteId === note.id
                    ? "text-primary-dark"
                    : "text-neutral-400"
                }`}>
                  <span>v{note.version}</span>
                  <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
