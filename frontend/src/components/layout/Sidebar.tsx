import { useDispatch, useSelector } from "react-redux";
import { addNote } from "../../features/notes/notesSlice";
import { selectFilteredNotes } from "../../features/notes/selectors";
import type { RootState } from "../../app/store";
import NoteItem from "../notes/NoteItem";
import SearchBar from "../search/SearchBar";

export default function Sidebar() {
  const dispatch = useDispatch();
  const filteredNotes = useSelector(selectFilteredNotes);
  const activeNoteId = useSelector(
    (state: RootState) => state.notes.activeNoteId
  );

  return (
    <div className="h-full p-5 flex flex-col">
  <h2 className="font-semibold text-lg mb-2">Notes</h2>

  <SearchBar />

  <button
    onClick={() => dispatch(addNote())}
    className="mb-4 w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition shadow-sm"

  >
    + New Note
  </button>

  <div className="flex-1">
    {filteredNotes.length > 0 && (
      <NoteItem
        note={filteredNotes[0]}
        isActive={filteredNotes[0].id === activeNoteId}
      />
    )}
  </div>
</div>

  );
}
