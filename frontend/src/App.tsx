import ConflictModal from "./components/notes/ConflictModal";
import RevisionPanel from "./components/notes/RevisionPanel";
import EditorLayout from "./components/layout/EditorLayout";



export default function App() {
  return (
    <>
      <EditorLayout />
      <ConflictModal />
    </>
  );
}

