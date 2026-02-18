import { useEffect, useState } from "react";
import { useAutosave } from "../../hooks/useAutosave";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../app/store";
import {
  updateBlock,
  addBlock,
  toggleCheckbox,
  changeBlockType,
  clearLastCreatedBlock,
  renameNote,
} from "../../features/notes/notesSlice";
import BlockEditor from "./BlockEditor";
import { useBeforeUnloadGuard } from "../../hooks/useBeforeUnloadGuard";
import SaveIndicator from "./SaveIndicator";
import PresenceBar from "../layout/PresenceBar";

export default function NoteEditor() {
  const dispatch = useDispatch();
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState("");

  const {
    activeNoteId,
    notes,
    localBlocks,
    saveStatus,
    lastCreatedBlockId,
  } = useSelector((state: RootState) => state.notes);

  const activeNote = activeNoteId ? notes[activeNoteId] : null;
  const version = activeNote?.version ?? 1;

  useEffect(() => {
    if (activeNote) {
      setTitleValue(activeNote.title);
    }
  }, [activeNote]);

  const shouldBlock =
    !!activeNoteId &&
    (saveStatus.state === "unsaved" ||
      saveStatus.state === "saving");

  useBeforeUnloadGuard(shouldBlock);

  useAutosave();
  useEffect(() => {
    if (lastCreatedBlockId) {
      dispatch(clearLastCreatedBlock());
    }
  }, [lastCreatedBlockId, dispatch]);

  if (!activeNoteId) {
    return (
      <div className="flex-1 flex items-center justify-center flex-col gap-4">
        <div className="text-6xl">📝</div>
        <div className="text-neutral-500 text-lg">
          Select a note to start editing
        </div>
      </div>
    );
  }

  const handleTitleBlur = () => {
    if (titleValue.trim()) {
      dispatch(
        renameNote({
          id: activeNoteId,
          title: titleValue.trim(),
        })
      );
    } else {
      setTitleValue(activeNote?.title || "Untitled Note");
    }
    setEditingTitle(false);
  };


  return (
    <div className="flex-1 flex flex-col bg-white min-h-0">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-neutral-200 shadow-sm">
        
        {/* Title Section */}
        <div className="px-10 py-6 border-b border-neutral-200">
          {editingTitle ? (
            <input
              autoFocus
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={(e) => e.key === "Enter" && handleTitleBlur()}
              className="text-4xl font-bold text-neutral-900 w-full border-none outline-none bg-transparent p-0"
              placeholder="Untitled Note"
            />
          ) : (
            <h1
              onClick={() => setEditingTitle(true)}
              className="text-4xl font-bold text-neutral-900 cursor-text hover:text-neutral-700 transition-colors"
            >
              {activeNote?.title || "Untitled Note"}
            </h1>
          )}

          <div className="text-sm text-neutral-500 mt-2">
            Last updated{" "}
            {new Date(activeNote?.updatedAt || Date.now()).toLocaleDateString()} at{" "}
            {new Date(activeNote?.updatedAt || Date.now()).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>

        {/* Collaboration / Status Row */}
        <div className="px-10 py-3 flex justify-between items-center bg-neutral-50">
          <div className="flex items-center gap-6">

            {/* Version */}
            <div className="text-xs text-neutral-500 font-medium">
              Version{" "}
              <span className="text-neutral-900 font-semibold">
                {version}
              </span>
            </div>

            {/* Live Indicator */}
            <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              Live
            </div>

            {/* Presence */}
            <PresenceBar />
          </div>

          {/* Save Status */}
          <SaveIndicator />
        </div>
      </div>

      {/* Scrollable Block Area */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-10 py-8 space-y-0.5">
          {localBlocks.map((block) => (
            <div key={block.id} className="group">
              <BlockEditor
                block={block}
                autoFocus={block.id === lastCreatedBlockId}
                onChange={(value) =>
                  dispatch(
                    updateBlock({
                      blockId: block.id,
                      content: value,
                    })
                  )
                }
                onEnter={(type) =>
                  dispatch(
                    addBlock({
                      afterId: block.id,
                      type: type || "paragraph",
                    })
                  )
                }
                onTypeChange={(type) =>
                  dispatch(
                    changeBlockType({
                      blockId: block.id,
                      type,
                    })
                  )
                }
                onToggleCheckbox={() =>
                  dispatch(
                    toggleCheckbox({
                      blockId: block.id,
                    })
                  )
                }
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
