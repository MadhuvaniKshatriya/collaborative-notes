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
    <div className="h-screen flex bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50">
      
      {/* Sidebar */}
      <div className="w-[340px] bg-white border-r border-slate-200 shadow-lg">
        <Sidebar />
      </div>

      {/* Main Editor */}
      <div className="flex-1 flex flex-col">
        <NoteEditor />
      </div>

      {/* Revision History */}
      <div className="w-[340px] bg-white border-l border-slate-200 shadow-lg">
        <RevisionPanel />
      </div>

    </div>
  );
}


