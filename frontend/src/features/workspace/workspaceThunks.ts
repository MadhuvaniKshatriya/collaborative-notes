import { createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getHeaders = () => ({
  'Content-Type': 'application/json',
});

interface CreateWorkspacePayload {
  name: string;
  description?: string;
}

export const GetWorkspacesThunk = createAsyncThunk<
  any[],
  void,
  { rejectValue: string }
>('workspace/getWorkspaces', async (_, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/workspaces`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      return rejectWithValue('Failed to fetch workspaces');
    }

    return await response.json();
  } catch (error) {
    return rejectWithValue((error as Error).message || 'Network error');
  }
});

export const CreateWorkspaceThunk = createAsyncThunk<
  any,
  CreateWorkspacePayload,
  { rejectValue: string }
>('workspace/create', async (payload, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/workspaces`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      return rejectWithValue(error.message || 'Failed to create workspace');
    }

    return await response.json();
  } catch (error) {
    return rejectWithValue((error as Error).message || 'Network error');
  }
});
