import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { GetWorkspacesThunk, CreateWorkspaceThunk } from './workspaceThunks';

interface Workspace {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

interface WorkspaceState {
  workspaces: Workspace[];
  currentWorkspaceId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: WorkspaceState = {
  workspaces: [],
  currentWorkspaceId: localStorage.getItem('currentWorkspaceId'),
  loading: false,
  error: null,
};

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {
    setCurrentWorkspace: (state, action: PayloadAction<string>) => {
      state.currentWorkspaceId = action.payload;
      localStorage.setItem('currentWorkspaceId', action.payload);
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Get Workspaces
    builder.addCase(GetWorkspacesThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(GetWorkspacesThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.workspaces = action.payload;
      if (action.payload.length > 0 && !state.currentWorkspaceId) {
        state.currentWorkspaceId = action.payload[0].id;
        localStorage.setItem('currentWorkspaceId', action.payload[0].id);
      }
    });
    builder.addCase(GetWorkspacesThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Create Workspace
    builder.addCase(CreateWorkspaceThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(CreateWorkspaceThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.workspaces.push(action.payload);
      state.currentWorkspaceId = action.payload.id;
      localStorage.setItem('currentWorkspaceId', action.payload.id);
    });
    builder.addCase(CreateWorkspaceThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { setCurrentWorkspace, clearError } = workspaceSlice.actions;
export default workspaceSlice.reducer;
