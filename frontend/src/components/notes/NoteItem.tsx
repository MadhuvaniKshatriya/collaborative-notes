import { useDispatch } from "react-redux";
import {
  setActiveNote,
  renameNote,
  deleteNote,
} from "../../features/notes/notesSlice";
import { useState } from "react";
import type { Note } from "../../features/notes/notesSlice";

interface Props {
  note: Note;
  isActive: boolean;
}

export default function NoteItem({
  note,
  isActive,
}: Props) {
  const dispatch = useDispatch();

  const [editing, setEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState(note.title);

  return (
    <div
      className={`p-3 mb-2 rounded transition ${
        isActive ? "bg-blue-100" : "hover:bg-gray-100"
      }`}
    >
      {editing ? (
        <input
          className="w-full border px-2 py-1 text-sm rounded"
          value={tempTitle}
          onChange={(e) => setTempTitle(e.target.value)}
          onBlur={() => {
            dispatch(
              renameNote({
                id: note.id,
                title: tempTitle.trim() || note.title,
              })
            );
            setEditing(false);
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
              onClick={() => setEditing(true)}
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

      <div className="text-xs text-gray-500 mt-1">
        v{note.version} •{" "}
        {new Date(note.updatedAt).toLocaleString()}
      </div>
    </div>
  );
}
