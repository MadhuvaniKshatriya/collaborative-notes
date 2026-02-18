import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "./Sidebar";
import NoteEditor from "../notes/NoteEditor";
import RevisionPanel from "../notes/RevisionPanel";
import { initializeNotesThunk } from "../../features/notes/notesThunk";
import { setActiveNote } from "../../features/notes/notesSlice";
import type { RootState } from "../../app/store";
import { useWebSocketConnection } from "../../hooks/useWebSocketConnection";

interface EditorLayoutProps {
  workspaceId: string;
  noteId?: string;
}

export default function EditorLayout({
  workspaceId,
  noteId,
}: EditorLayoutProps) {
  const dispatch = useDispatch();
  const { activeNoteId } = useSelector((state: RootState) => state.notes);

  useWebSocketConnection(activeNoteId ?? "");

  useEffect(() => {
    void dispatch(initializeNotesThunk(workspaceId) as any);
  }, [dispatch, workspaceId]);

  useEffect(() => {
    if (noteId && noteId !== activeNoteId) {
      dispatch(setActiveNote(noteId));
    }
  }, [dispatch, noteId, activeNoteId]);

  return (
    <div className="h-screen flex bg-white">
      <div className="w-80 border-r border-neutral-200 flex flex-col shadow-sm">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <NoteEditor />
      </div>

      <div className="w-80 border-l border-neutral-200 flex flex-col shadow-sm">
        <RevisionPanel />
      </div>
    </div>
  );
}
