import { highlightMatches } from "../../utils/highlightUtils";

interface HighlightedTextProps {
  text: string;
  searchQuery: string;
  className?: string;
}

export default function HighlightedText({
  text,
  searchQuery,
  className = "",
}: HighlightedTextProps) {
  const parts = highlightMatches(text, searchQuery);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (typeof part === "string") {
          return <span key={index}>{part}</span>;
        }
        return (
          <mark
            key={index}
            className="bg-yellow-200 text-neutral-900 font-semibold px-0.5 rounded"
          >
            {part.text}
          </mark>
        );
      })}
    </span>
  );
}
