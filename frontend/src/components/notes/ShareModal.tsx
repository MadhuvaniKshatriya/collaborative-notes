import { useState } from "react";

interface ShareModalProps {
  isOpen: boolean;
  shareUrl: string;
  onClose: () => void;
}

export default function ShareModal({
  isOpen,
  shareUrl,
  onClose,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const fullShareUrl = `${window.location.origin}/share/${shareUrl}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fullShareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg p-6 w-96 max-w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-neutral-900">Share Note</h2>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <p className="text-neutral-600 mb-4">
          Share this link with anyone to let them view this note:
        </p>

        <div className="bg-neutral-100 rounded-lg p-3 mb-4 break-all text-sm text-neutral-700">
          {fullShareUrl}
        </div>

        <button
          onClick={handleCopyLink}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
            copied
              ? "bg-green-100 text-green-700"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
        >
          {copied ? "✓ Copied to clipboard" : "Copy Link"}
        </button>

        <button
          onClick={onClose}
          className="w-full mt-2 py-2 px-4 rounded-lg font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
