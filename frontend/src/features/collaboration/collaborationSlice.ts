import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  username: string;
  avatar: string;
}

interface Comment {
  id: string;
  blockId: string;
  content: string;
  author: User;
  resolved: boolean;
  createdAt: string;
}

interface Activity {
  id: string;
  actionType: string;
  user: User;
  metadata: any;
  createdAt: string;
}

interface CursorPosition {
  userId: string;
  blockId: string;
  position: number;
  user: User;
}

interface CollaborationState {
  activeUsers: User[];
  comments: Comment[];
  cursorPositions: Record<string, CursorPosition>;
  activityLog: Activity[];
  typingUsers: string[];
}

const initialState: CollaborationState = {
  activeUsers: [],
  comments: [],
  cursorPositions: {},
  activityLog: [],
  typingUsers: [],
};

const collaborationSlice = createSlice({
  name: 'collaboration',
  initialState,
  reducers: {
    setActiveUsers: (state, action: PayloadAction<User[]>) => {
      state.activeUsers = action.payload;
    },
    addActiveUser: (state, action: PayloadAction<User>) => {
      state.activeUsers = [
        ...state.activeUsers.filter((u) => u.id !== action.payload.id),
        action.payload,
      ];
    },
    removeActiveUser: (state, action: PayloadAction<string>) => {
      state.activeUsers = state.activeUsers.filter(
        (u) => u.id !== action.payload,
      );
    },
    setComments: (state, action: PayloadAction<Comment[]>) => {
      state.comments = action.payload;
    },
    addComment: (state, action: PayloadAction<Comment>) => {
      state.comments.push(action.payload);
    },
    updateComment: (state, action: PayloadAction<Comment>) => {
      const index = state.comments.findIndex((c) => c.id === action.payload.id);
      if (index !== -1) {
        state.comments[index] = action.payload;
      }
    },
    setCursorPosition: (state, action: PayloadAction<CursorPosition>) => {
      state.cursorPositions[action.payload.userId] = action.payload;
    },
    clearCursorPosition: (state, action: PayloadAction<string>) => {
      delete state.cursorPositions[action.payload];
    },
    setActivityLog: (state, action: PayloadAction<Activity[]>) => {
      state.activityLog = action.payload;
    },
    addActivity: (state, action: PayloadAction<Activity>) => {
      state.activityLog.unshift(action.payload);
    },
    setTypingUsers: (state, action: PayloadAction<string[]>) => {
      state.typingUsers = action.payload;
    },
  },
});

export const {
  setActiveUsers,
  addActiveUser,
  removeActiveUser,
  setComments,
  addComment,
  updateComment,
  setCursorPosition,
  clearCursorPosition,
  setActivityLog,
  addActivity,
  setTypingUsers,
} = collaborationSlice.actions;

export default collaborationSlice.reducer;
