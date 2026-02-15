import { useEffect } from "react";
import { useAutosave } from "../../hooks/useAutosave";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../app/store";
import {
  updateBlock,
  addBlock,
  toggleCheckbox,
  changeBlockType,
  clearLastCreatedBlock,
} from "../../features/notes/notesSlice";
import BlockEditor from "./BlockEditor";
import { useBeforeUnloadGuard } from "../../hooks/useBeforeUnloadGuard";
import SaveIndicator from "./SaveIndicator";

export default function NoteEditor() {
  const dispatch = useDispatch();

  const {
    activeNoteId,
    localBlocks,
    saveStatus,
    lastCreatedBlockId,
  } = useSelector((state: RootState) => state.notes);

  /* ============================
     Prevent Refresh Data Loss
  ============================ */

  const shouldBlock =
    !!activeNoteId &&
    (saveStatus.state === "unsaved" ||
      saveStatus.state === "saving");

  useBeforeUnloadGuard(shouldBlock);

  /* ============================
     Autosave Hook
  ============================ */

  useAutosave();

  /* ============================
     Clear Focus Flag After Use
  ============================ */

  useEffect(() => {
    if (lastCreatedBlockId) {
      dispatch(clearLastCreatedBlock());
    }
  }, [lastCreatedBlockId, dispatch]);

  /* ============================
     Empty State
  ============================ */

  if (!activeNoteId) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 text-lg">
        Select a note to start editing
      </div>
    );
  }

  /* ============================
     Render
  ============================ */

 return (
  <div className="flex-1 flex flex-col bg-gray-100">
    {/* Top Status Bar */}
    <div className="px-8 py-4 bg-white border-b flex justify-end">
      <SaveIndicator />
    </div>

    {/* Block Editor Area */}
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-10 py-10 space-y-3">
        {localBlocks.map((block) => (
          <BlockEditor
            key={block.id}
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
        ))}
      </div>
    </div>
  </div>
);

}
