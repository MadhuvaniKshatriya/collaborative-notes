import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import type { RootState } from "../../app/store";

export default function SaveIndicator() {
  const saveStatus = useSelector(
    (state: RootState) => state.notes.saveStatus
  );
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    if (saveStatus.state === "saved") {
      setShowMessage(true);
      const timer = setTimeout(() => setShowMessage(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [saveStatus.state]);

  const getStatusDisplay = () => {
    switch (saveStatus.state) {
      case "saving":
        return {
          icon: "●",
          text: "Saving",
          color: "text-amber-600",
          bg: "bg-amber-50",
          animate: true,
        };
      case "saved":
        return {
          icon: "✓",
          text: "Saved",
          color: "text-green-600",
          bg: "bg-green-50",
          animate: false,
        };
      case "error":
        return {
          icon: "✕",
          text: "Save failed",
          color: "text-red-600",
          bg: "bg-red-50",
          animate: false,
        };
      case "conflict":
        return {
          icon: "⚠",
          text: "Conflict detected",
          color: "text-orange-600",
          bg: "bg-orange-50",
          animate: false,
        };
      default:
        return {
          icon: "●",
          text: "Unsaved changes",
          color: "text-neutral-500",
          bg: "bg-neutral-100",
          animate: false,
        };
    }
  };

  const status = getStatusDisplay();

  return (
    <div className="relative">
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
          status.color
        } ${status.bg} ${status.animate ? "pulse" : ""}`}
      >
        <span>{status.icon}</span>
        <span>{status.text}</span>
      </div>

      {/* Success message that fades */}
      {showMessage && saveStatus.state === "saved" && (
        <div className="absolute right-0 top-full mt-2 text-xs text-green-600 font-medium animate-fadeOut">
          All changes saved ✓
        </div>
      )}
    </div>
  );
}

