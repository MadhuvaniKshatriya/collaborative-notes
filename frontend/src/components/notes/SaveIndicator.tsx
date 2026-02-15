import { useSelector } from "react-redux";
import type { RootState } from "../../app/store";

export default function SaveIndicator() {
  const saveStatus = useSelector(
    (state: RootState) => state.notes.saveStatus
  );

  const color =
    saveStatus.state === "saving"
      ? "bg-yellow-100 text-yellow-600"
      : saveStatus.state === "saved"
      ? "bg-green-100 text-green-600"
      : saveStatus.state === "error"
      ? "bg-red-100 text-red-600"
      : saveStatus.state === "conflict"
      ? "bg-orange-100 text-orange-600"
      : "bg-gray-100 text-gray-600";

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${color}`}
    >
      {saveStatus.state}
    </span>
  );
}

