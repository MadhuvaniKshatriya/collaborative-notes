import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../app/store";
import { setSearchQuery } from "../../features/notes/notesSlice";

export default function SearchBar() {
  const dispatch = useDispatch();
  const { searchQuery } = useSelector(
    (state: RootState) => state.notes
  );

  return (
    <input
      type="text"
      placeholder="Search notes..."
      value={searchQuery}
      onChange={(e) => dispatch(setSearchQuery(e.target.value))}
      className="w-full border px-3 py-2 mb-4 rounded text-sm"
    />
  );
}
