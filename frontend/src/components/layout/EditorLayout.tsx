import Sidebar from "./Sidebar";
import NoteEditor from "../notes/NoteEditor";
import RevisionPanel from "../notes/RevisionPanel";

export default function EditorLayout() {
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


