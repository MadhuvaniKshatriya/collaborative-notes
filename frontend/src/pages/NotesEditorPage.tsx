import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import EditorLayout from '../components/layout/EditorLayout';

export default function NotesEditorPage() {
  const { workspaceId, noteId } =
    useParams<{ workspaceId: string; noteId: string }>();

  if (!workspaceId || !noteId) {
    return <div>Invalid route</div>;
  }

  return (
    <EditorLayout
      workspaceId={workspaceId}
      noteId={noteId}
    />
  );
}

