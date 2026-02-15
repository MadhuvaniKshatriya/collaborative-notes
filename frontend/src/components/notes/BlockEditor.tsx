import { useState, useRef, useEffect } from "react";
import type { Block, BlockType } from "../../features/notes/types";
import SlashMenu from "./SlashMenu";

interface Props {
    block: Block;
    onChange: (value: string) => void;
    onEnter: (type?: BlockType) => void;
    onTypeChange: (type: BlockType) => void;
    onToggleCheckbox: () => void;
    autoFocus?: boolean;
}

export default function BlockEditor({
    block,
    onChange,
    onEnter,
    onTypeChange,
    onToggleCheckbox,
    autoFocus,
}: Props) {
    const [showMenu, setShowMenu] = useState(false);
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
    const autoResize = (el: HTMLTextAreaElement) => {
        el.style.height = "auto";
        el.style.height = el.scrollHeight + "px";
    };


    /* ============================
       Slash Detection
    ============================ */

    const handleChange = (value: string) => {
        onChange(value);

        if (value.endsWith("/")) {
            setShowMenu(true);
        } else {
            setShowMenu(false);
        }
    };

    const handleSelect = (type: BlockType) => {
        onTypeChange(type);

        // remove trailing slash
        const updated = block.content.replace(/\/$/, "");
        onChange(updated);

        setShowMenu(false);

        setTimeout(() => {
            inputRef.current?.focus();
        }, 0);
        };


    const handleKeyDown = (e: React.KeyboardEvent) => {
        // Backspace on empty checkbox → convert to paragraph
        if (
        e.key === "Backspace" &&
        block.type === "checkbox" &&
        block.content.trim() === ""
        ) {
        e.preventDefault();
        onTypeChange("paragraph");
        return;
        }

        // SHIFT+ENTER → create paragraph block
        if (e.key === "Enter" && e.shiftKey) {
            e.preventDefault();
            onEnter("paragraph");
            return;
        }

        // ENTER inside checkbox → create another checkbox
        if (e.key === "Enter" && block.type === "checkbox") {
            e.preventDefault();
            onEnter("checkbox");
            return;
        }

        // ENTER inside paragraph → allow newline
        if (e.key === "Enter" && block.type === "paragraph") {
            return; // default newline
        }

        if (e.key === "Escape") {
            setShowMenu(false);
        }
        };



    /* ============================
       Render Different Block Types
    ============================ */

    let element;

    switch (block.type) {
        case "heading":
            element = (
                <input
                    ref={inputRef as React.RefObject<HTMLInputElement>}
                    className="text-3xl font-bold w-full outline-none py-1 bg-transparent"
                    value={block.content}
                    onChange={(e) => handleChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Heading"
                />
            );
            break;

        case "checkbox":
            element = (
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={block.checked || false}
                        onChange={onToggleCheckbox}
                        className="h-4 w-4"
                    />
                    <input
                        ref={inputRef as React.RefObject<HTMLInputElement>}
                        className="flex-1 outline-none py-1 bg-transparent"
                        value={block.content}
                        onChange={(e) => handleChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="To-do item"
                    />
                </div>
            );
            break;

        case "code":
            element = (
                <textarea
                    ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                    className="w-full bg-gray-100 font-mono p-3 rounded outline-none"
                    value={block.content}
                    onChange={(e) => handleChange(e.target.value)}
                    placeholder="Code block"
                />
            );
            break;

        case "bullet":
            element = (
                <div className="flex items-start gap-2">
                    <span className="mt-2 text-gray-500">•</span>
                    <input
                        ref={inputRef as React.RefObject<HTMLInputElement>}
                        className="flex-1 outline-none py-1 bg-transparent"
                        value={block.content}
                        onChange={(e) => handleChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="List item"
                    />
                </div>
            );
            break;

        default:
            element = (
                <textarea
                    ref={(el) => {
                        inputRef.current = el;
                        if (el) autoResize(el);
                    }}
                    className="w-full outline-none py-1 bg-transparent resize-none"
                    value={block.content}
                    placeholder="Type '/' for commands..."
                    onChange={(e) => {
                        handleChange(e.target.value);
                        autoResize(e.target);
                    }}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    style={{ overflow: "hidden" }}
                />
            );

    }

    /* ============================
       Return
    ============================ */
    useEffect(() => {
    if (autoFocus) {
        inputRef.current?.focus();
    }
    }, [autoFocus]);


    return (
        <div className="relative group">
            {element}

            {showMenu && (
                <SlashMenu onSelect={handleSelect} />
            )}
        </div>
    );
}

