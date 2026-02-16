import { useDispatch } from "react-redux";
import { createNoteThunk } from "../../features/notes/notesThunk";
import SearchBar from "../search/SearchBar";
import NotesList from "../notes/NotesList";

export default function Sidebar() {
  const dispatch = useDispatch();

  const handleCreateNote = () => {
    void dispatch(createNoteThunk() as any);
  };

  return (
    <div className="h-full p-5 flex flex-col">
  <h2 className="font-semibold text-lg mb-2">Notes</h2>

  <SearchBar />

  <button
    onClick={handleCreateNote}
    className="mb-4 w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition shadow-sm"

  >
    + New Note
  </button>

  <div className="flex-1 overflow-y-auto">
    <NotesList />
  </div>
</div>

  );
}
