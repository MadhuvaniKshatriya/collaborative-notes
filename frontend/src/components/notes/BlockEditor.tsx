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

        // For checkbox, bullet, code: clear the content and start fresh
        if (type === "checkbox" || type === "bullet" || type === "code") {
            onChange("");
        } else {
            // For other types: remove trailing slash and keep content
            const updated = block.content.replace(/\/$/, "");
            onChange(updated);
        }

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
                    className="text-3xl font-bold w-full outline-none py-2 px-3 bg-transparent text-neutral-900 rounded-lg hover:bg-neutral-50 transition-colors"
                    value={block.content}
                    onChange={(e) => handleChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Heading"
                />
            );
            break;

        case "checkbox":
            element = (
                <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-neutral-50 transition-colors group">
                    <input
                        type="checkbox"
                        checked={block.checked || false}
                        onChange={onToggleCheckbox}
                        className="mt-1 h-5 w-5 flex-shrink-0"
                    />
                    <input
                        ref={inputRef as React.RefObject<HTMLInputElement>}
                        className={`flex-1 outline-none py-1 px-2 bg-transparent rounded transition-all ${
                            block.checked ? "line-through text-neutral-400" : "text-neutral-900"
                        }`}
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
                ref={(el) => {
                    inputRef.current = el;
                    if (el) {
                    el.style.height = "auto";
                    el.style.height = el.scrollHeight + "px";
                    }
                }}
                className="w-full bg-neutral-900 text-neutral-50 font-mono p-4 rounded-lg border border-neutral-800 outline-none resize-none shadow-sm hover:shadow-md transition-shadow"
                value={block.content}
                onChange={(e) => {
                    handleChange(e.target.value);
                    e.target.style.height = "auto";
                    e.target.style.height = e.target.scrollHeight + "px";
                }}
                placeholder="// Code block..."
                onKeyDown={(e) => {
                    // SHIFT + ENTER → new block
                    if (e.key === "Enter" && e.shiftKey) {
                    e.preventDefault();
                    onEnter("paragraph");
                    return;
                    }

                    // ENTER → stay inside code block (default behavior)
                    if (e.key === "Enter" && !e.shiftKey) {
                    return; // allow newline
                    }

                    if (e.key === "Escape") {
                    setShowMenu(false);
                    }
                }}
                rows={1}
                style={{ overflow: "hidden" }}
                />
            );
            break;

        case "bullet":
            element = (
                <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-neutral-50 transition-colors">
                    <span className="mt-1 text-neutral-600 font-semibold flex-shrink-0">•</span>
                    <input
                        ref={inputRef as React.RefObject<HTMLInputElement>}
                        className="flex-1 outline-none py-1 px-2 bg-transparent rounded transition-all text-neutral-900"
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
                    className="w-full outline-none py-2 px-3 bg-transparent resize-none text-neutral-900 rounded-lg hover:bg-neutral-50 transition-colors focus:bg-neutral-50"
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

