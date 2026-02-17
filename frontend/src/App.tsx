import React, { useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from './app/store';
import { GetWorkspacesThunk } from './features/workspace/workspaceThunks';

// Pages & Components
import EditorLayout from './components/layout/EditorLayout';
import ConflictModal from './components/notes/ConflictModal';
import WorkspacesPage from './pages/WorkspacesPage';
import NotesEditorPage from './pages/NotesEditorPage';

function AppContent() {
  const dispatch = useDispatch<AppDispatch>();
  const { workspaces, currentWorkspaceId } = useSelector(
    (state: RootState) => state.workspace
  );

  // Load workspaces on app start
  useEffect(() => {
    if (workspaces.length === 0) {
      void dispatch(GetWorkspacesThunk());
    }
  }, [dispatch, workspaces.length]);

  return (
    <>
      <Routes>
        {/* App Routes */}
        <Route path="/workspaces" element={<WorkspacesPage />} />

        <Route
          path="/workspaces/:workspaceId/notes/:noteId"
          element={<NotesEditorPage />}
        />

        <Route
          path="/workspaces/:workspaceId"
          element={
            currentWorkspaceId ? (
              <EditorLayout workspaceId={currentWorkspaceId} />
            ) : (
              <Navigate to="/workspaces" replace />
            )
          }
        />

        {/* Shared note (public) */}
        <Route path="/share/:shareToken" element={<div>Shared Note View</div>} />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/workspaces" replace />} />
      </Routes>
      <ConflictModal />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}



