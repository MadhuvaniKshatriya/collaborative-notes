import { useEffect } from "react";
import { useDispatch } from "react-redux";
import Sidebar from "./Sidebar";
import NoteEditor from "../notes/NoteEditor";
import RevisionPanel from "../notes/RevisionPanel";
import { initializeNotesThunk } from "../../features/notes/notesThunk";

export default function EditorLayout() {
  const dispatch = useDispatch();

  useEffect(() => {
    void dispatch(initializeNotesThunk() as any);
  }, [dispatch]);

  return (
    <div className="h-screen flex bg-white">
      
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-neutral-200 flex flex-col overflow-hidden shadow-sm">
        <Sidebar />
      </div>

      {/* Main Editor */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <NoteEditor />
      </div>

      {/* Revision History */}
      <div className="w-80 bg-white border-l border-neutral-200 flex flex-col overflow-hidden shadow-sm">
        <RevisionPanel />
      </div>

    </div>
  );
}


