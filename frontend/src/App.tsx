import NotesList from "./components/notes/NotesList";
import NoteEditor from "./components/notes/NoteEditor";
import ConflictModal from "./components/notes/ConflictModal";
import RevisionPanel from "./components/notes/RevisionPanel";



export default function App() {
  return (
    <div className="h-screen flex bg-gray-100">
      <NotesList />
      <NoteEditor />
      <RevisionPanel />
      <ConflictModal />
    </div>
  );
}
