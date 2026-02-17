import { configureStore } from "@reduxjs/toolkit";
import workspaceReducer from "../features/workspace/workspaceSlice";
import notesReducer from "../features/notes/notesSlice";
import collaborationReducer from "../features/collaboration/collaborationSlice";

export const store = configureStore({
  reducer: {
    workspace: workspaceReducer,
    notes: notesReducer,
    collaboration: collaborationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
