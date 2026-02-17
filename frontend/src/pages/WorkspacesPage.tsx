import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState, AppDispatch } from '../app/store';
import { GetWorkspacesThunk, CreateWorkspaceThunk } from '../features/workspace/workspaceThunks';
import './WorkspacesPage.css';

export default function WorkspacesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const user = { id: 'anonymous', username: 'Guest', avatar: '' };
  const { workspaces, loading } = useSelector(
    (state: RootState) => state.workspace,
  );
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaceDescription, setWorkspaceDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (workspaces.length === 0) {
      void dispatch(GetWorkspacesThunk());
    }
  }, [dispatch, workspaces.length]);

  const handleLogout = () => {
    navigate('/');
  };

  const handleSelectWorkspace = (workspaceId: string) => {
    navigate(`/workspaces/${workspaceId}`);
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceName.trim()) return;

    setIsCreating(true);
    try {
      const result = await dispatch(
        CreateWorkspaceThunk({
          name: workspaceName,
          description: workspaceDescription,
        }),
      );

      if (result.meta.requestStatus === 'fulfilled') {
        setWorkspaceName('');
        setWorkspaceDescription('');
        setShowCreateForm(false);
        void dispatch(GetWorkspacesThunk());
      }
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="workspaces-page">
      <div className="workspaces-header">
        <div className="workspaces-logo">
          <div className="workspaces-icon">📝</div>
          <h1>Collaborative Notes</h1>
        </div>
        <div className="workspaces-user">
          <span className="workspaces-username">{user.username}</span>
        </div>
      </div>

      <div className="workspaces-container">
        <div className="workspaces-content">
          <div className="workspaces-header-row">
            <h2>Your Workspaces</h2>
            <button
              className="btn-create-workspace"
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              + Create Workspace
            </button>
          </div>

          {showCreateForm && (
            <form className="create-workspace-form" onSubmit={handleCreateWorkspace}>
              <div className="form-group">
                <label htmlFor="workspace-name">Workspace Name</label>
                <input
                  id="workspace-name"
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="My Workspace"
                  required
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label htmlFor="workspace-desc">Description (optional)</label>
                <input
                  id="workspace-desc"
                  type="text"
                  value={workspaceDescription}
                  onChange={(e) => setWorkspaceDescription(e.target.value)}
                  placeholder="What is this workspace for?"
                />
              </div>
              <div className="form-actions">
                <button
                  type="submit"
                  disabled={isCreating || !workspaceName.trim()}
                  className="btn-submit"
                >
                  {isCreating ? 'Creating...' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setWorkspaceName('');
                    setWorkspaceDescription('');
                  }}
                  className="btn-cancel"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {loading ? (
            <div className="workspaces-loading">Loading workspaces...</div>
          ) : workspaces.length > 0 ? (
            <div className="workspaces-grid">
              {workspaces.map((workspace) => (
                <button
                  key={workspace.id}
                  className="workspace-card"
                  onClick={() => handleSelectWorkspace(workspace.id)}
                >
                  <div className="workspace-card-icon">📊</div>
                  <div className="workspace-card-info">
                    <h3>{workspace.name}</h3>
                    {workspace.description && (
                      <p>{workspace.description}</p>
                    )}
                  </div>
                  <div className="workspace-card-arrow">→</div>
                </button>
              ))}
            </div>
          ) : (
            <div className="workspaces-empty">
              <p>No workspaces yet. Click "Create Workspace" to get started!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
