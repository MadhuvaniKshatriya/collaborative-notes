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
    <div className="h-screen flex bg-gray-100">
      
      {/* Sidebar */}
      <div className="w-[340px] bg-white border-r shadow-sm">
        <Sidebar />
      </div>

      {/* Main Editor */}
      <div className="flex-1 flex flex-col">
        <NoteEditor />
      </div>

      {/* Revision History */}
      <div className="w-[340px] bg-white border-l shadow-sm">
        <RevisionPanel />
      </div>

    </div>
  );
}


