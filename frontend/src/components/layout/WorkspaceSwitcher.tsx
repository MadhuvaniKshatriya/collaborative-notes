import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { AppDispatch, RootState } from '../../app/store';
import { setCurrentWorkspace } from '../../features/workspace/workspaceSlice';
import { CreateWorkspaceThunk } from '../../features/workspace/workspaceThunks';
import './WorkspaceSwitcher.css';

export default function WorkspaceSwitcher() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { workspaces, currentWorkspaceId } = useSelector(
    (state: RootState) => state.workspace,
  );
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');

  const currentWorkspace = workspaces.find((w) => w.id === currentWorkspaceId);

  const handleSelectWorkspace = (workspaceId: string) => {
    dispatch(setCurrentWorkspace(workspaceId));
    navigate(`/workspaces/${workspaceId}`);
    setShowDropdown(false);
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;

    const result = await dispatch(
      CreateWorkspaceThunk({
        name: newWorkspaceName,
        description: '',
      }),
    );

    if (result.meta.requestStatus === 'fulfilled') {
      dispatch(setCurrentWorkspace(result.payload.id));
      navigate(`/workspaces/${result.payload.id}`);
      setNewWorkspaceName('');
      setShowCreate(false);
      setShowDropdown(false);
    }
  };

  return (
    <div className="workspace-switcher">
      <button
        className="workspace-button"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <div className="workspace-info">
          <div className="workspace-icon">📊</div>
          <div>
            <div className="workspace-name">
              {currentWorkspace?.name || 'Select Workspace'}
            </div>
            <div className="workspace-count">
              {workspaces.length} workspace{workspaces.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
        <div className="workspace-chevron">▼</div>
      </button>

      {showDropdown && (
        <div className="workspace-dropdown">
          <div className="workspace-list">
            {workspaces.map((workspace) => (
              <button
                key={workspace.id}
                className={`workspace-item ${
                  workspace.id === currentWorkspaceId ? 'active' : ''
                }`}
                onClick={() => handleSelectWorkspace(workspace.id)}
              >
                <span className="workspace-item-icon">📊</span>
                <div className="workspace-item-info">
                  <div className="workspace-item-name">{workspace.name}</div>
                  {workspace.description && (
                    <div className="workspace-item-desc">
                      {workspace.description}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="workspace-divider" />

          {!showCreate ? (
            <button
              className="workspace-create-button"
              onClick={() => setShowCreate(true)}
            >
              + New Workspace
            </button>
          ) : (
            <form onSubmit={handleCreateWorkspace} className="workspace-create-form">
              <input
                type="text"
                placeholder="Workspace name..."
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                autoFocus
              />
              <div className="workspace-create-buttons">
                <button type="submit" className="create-confirm">
                  Create
                </button>
                <button
                  type="button"
                  className="create-cancel"
                  onClick={() => {
                    setShowCreate(false);
                    setNewWorkspaceName('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
