import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../app/store";
import { setSearchQuery } from "../../features/notes/notesSlice";

export default function SearchBar() {
  const dispatch = useDispatch();
  const { searchQuery } = useSelector(
    (state: RootState) => state.notes
  );

  return (
    <div className="relative mb-5">
      <input
        type="text"
        placeholder="🔍 Search notes..."
        value={searchQuery}
        onChange={(e) => dispatch(setSearchQuery(e.target.value))}
        className="w-full border border-slate-300 px-4 py-2.5 rounded-lg text-sm bg-white shadow-sm hover:shadow-md focus:shadow-md transition-all focus:border-blue-400"
      />
      {searchQuery && (
        <button
          onClick={() => dispatch(setSearchQuery(""))}
          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-lg"
        >
          ✕
        </button>
      )}
    </div>
  );
}
