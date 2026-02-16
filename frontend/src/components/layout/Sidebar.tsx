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
    <div className="h-full p-6 flex flex-col bg-white">
  <div className="mb-6">
    <div className="flex items-center gap-3 mb-2">
      <div className="text-2xl">📝</div>
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Notes</h1>
        <p className="text-xs text-neutral-500">Collaborative workspace</p>
      </div>
    </div>
  </div>

  <SearchBar />

  <button
    onClick={handleCreateNote}
    className="mb-5 w-full bg-primary text-blue py-2.5 rounded-lg hover:bg-blue-600 active:bg-blue-700 transition font-medium shadow-sm hover:shadow-md"
  >
    + New Note
  </button>

  <div className="flex-1 overflow-y-auto">
    <NotesList />
  </div>
</div>

  );
}
