import type { BlockType } from "../../features/notes/types";

interface SlashMenuProps {
  onSelect: (type: BlockType) => void;
}

export default function SlashMenu({ onSelect }: SlashMenuProps) {
  const options: { label: string; type: BlockType }[] = [
    { label: "Heading", type: "heading" },
    { label: "Checkbox", type: "checkbox" },
    { label: "Code", type: "code" },
    { label: "Bullet", type: "bullet" },
  ];

  return (
    <div className="absolute z-50 mt-1 w-40 bg-white border rounded shadow-lg">
      {options.map((option) => (
        <div
          key={option.type}
          onClick={() => onSelect(option.type)}
          className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
        >
          /{option.type}
        </div>
      ))}
    </div>
  );
}
