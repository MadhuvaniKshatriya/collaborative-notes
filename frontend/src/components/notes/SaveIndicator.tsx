import { useSelector } from "react-redux";
import type { RootState } from "../../app/store";

export default function SaveIndicator() {
  const saveStatus = useSelector(
    (state: RootState) => state.notes.saveStatus
  );

  const getStatusDisplay = () => {
    switch (saveStatus.state) {
      case "saving":
        return { icon: "💾", text: "Saving...", color: "bg-amber-100 text-amber-700" };
      case "saved":
        return { icon: "✓", text: "Saved", color: "bg-green-100 text-green-700" };
      case "error":
        return { icon: "✕", text: "Error", color: "bg-red-100 text-red-700" };
      case "conflict":
        return { icon: "⚠", text: "Conflict", color: "bg-orange-100 text-orange-700" };
      default:
        return { icon: "●", text: "Unsaved", color: "bg-slate-200 text-slate-600" };
    }
  };

  const status = getStatusDisplay();

  return (
    <span
      className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 ${status.color} transition-all shadow-sm`}
    >
      <span className="animate-pulse">{status.icon}</span>
      {status.text}
    </span>
  );
}

