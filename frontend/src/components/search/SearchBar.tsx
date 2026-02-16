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
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
        🔍
      </div>
      <input
        type="text"
        placeholder="Search notes..."
        value={searchQuery}
        onChange={(e) => dispatch(setSearchQuery(e.target.value))}
        className="w-full border border-neutral-200 px-4 pl-10 py-2.5 rounded-lg text-sm bg-white shadow-sm hover:shadow-md focus:shadow-md focus:border-primary transition-all"
      />
      {searchQuery && (
        <button
          onClick={() => dispatch(setSearchQuery(""))}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 text-lg transition-colors"
        >
          ✕
        </button>
      )}
    </div>
  );
}
