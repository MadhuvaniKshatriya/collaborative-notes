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
    <div className="h-full p-6 flex flex-col bg-gradient-to-b from-slate-50 to-slate-100 border-r border-slate-200">
  <div className="mb-6">
    <h1 className="text-2xl font-bold text-slate-800">📝 Notes</h1>
    <p className="text-xs text-slate-400 mt-1">Collaborative notes with autosave</p>
  </div>

  <SearchBar />

  <button
    onClick={handleCreateNote}
    className="mb-5 w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg hover:shadow-lg hover:from-blue-600 hover:to-blue-700 transition shadow-md font-medium"

  >
    ➕ New Note
  </button>

  <div className="flex-1 overflow-y-auto">
    <NotesList />
  </div>
</div>

  );
}
