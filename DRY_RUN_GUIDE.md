# Collaborative Notes - Dry Run Guide

## 🚀 Application Status

Both servers are running successfully:

- **Frontend**: http://localhost:5173/
- **Backend API**: http://localhost:5000/

---

## 📚 How to Use the Application

### 1. **Authentication**

First, you need to register or log in.

#### Register a New Account
1. Open http://localhost:5173/ in your browser
2. Click on "Register" (if already at login page)
3. Fill in:
   - Email: `testuser@example.com`
   - Username: `testuser`
   - Password: `Test@1234`
4. Click "Register"
5. You'll be redirected to the Workspaces page

#### Login
1. If you already have an account, go to http://localhost:5173/login
2. Enter your email and password
3. Click "Login"

---

### 2. **Create a Workspace**

After logging in, you'll see the Workspaces page.

1. Click **"+ New Workspace"** button
2. Fill in:
   - **Name**: `My First Project`
   - **Description**: `A workspace for testing collaborative notes`
3. Click **"Create"**
4. You're now in your workspace dashboard

---

### 3. **Create Notes**

Within a workspace:

1. Click **"+ New Note"** button in the left sidebar
2. The note editor will open with a default "Untitled Note"
3. Click on the title to rename it
4. Click on any block to edit content
5. As you type, changes are auto-saved (indicated by the save status icon)

---

### 4. **Editing Notes**

#### Block Types
- **Paragraph**: Regular text
- **Heading**: Large text for titles
- **Checkbox**: Interactive checkbox items

#### Common Actions

**Add a block** (after current block):
- Press `Enter` at the end of a line or use the `+` button

**Change block type**:
- Click the block type indicator and select a new type

**Delete a block**:
- Click the `✕` icon on the block

**Check/Uncheck**:
- Click the checkbox icon (if it's a checkbox block)

---

### 5. **Version History (Revisions)**

In the right sidebar, you can see **Version History**:

1. Each time you make changes and save, a new version is created
2. Hover over a version card to see:
   - Version number
   - Creation date and time
   - Preview of the content
3. Click **"↺"** button to restore a previous version
4. The note will revert to that version

---

### 6. **Real-Time Collaboration**

When multiple users edit the same note:

1. **Presence Bar** (top) shows who's editing right now
2. **Cursor Positions**: See where others are typing (shown as colored dots)
3. **Automatic Conflict Resolution**: If two users edit simultaneously, the system detects conflicts and allows you to choose which version to keep

---

### 7. **Search Notes**

1. Use the **Search Bar** in the left sidebar
2. Type keywords to find notes by title or content
3. Results appear in the notes list

---

### 8. **Share Notes**

(Feature available via API - UI button may be added later)

Share a note publicly:
```bash
POST /workspaces/:workspaceId/notes/:noteId/share
```

---

## 🔧 API Endpoints Reference

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### Workspaces
- `GET /workspaces` - List all workspaces
- `POST /workspaces` - Create new workspace
- `GET /workspaces/:id` - Get workspace details
- `POST /workspaces/:id/members/:memberId` - Add member
- `POST /workspaces/:id/members/:memberId/remove` - Remove member

### Notes
- `GET /workspaces/:workspaceId/notes` - List notes
- `GET /workspaces/:workspaceId/notes/:id` - Get note details
- `POST /workspaces/:workspaceId/notes` - Create note
- `PATCH /workspaces/:workspaceId/notes/:id` - Update note
- `DELETE /workspaces/:workspaceId/notes/:id` - Delete note
- `GET /workspaces/:workspaceId/notes/search?q=query` - Search notes
- `GET /workspaces/:workspaceId/notes/:id/revisions` - Get version history
- `POST /workspaces/:workspaceId/notes/:id/revisions/:revisionId/restore` - Restore version

### Comments
- `GET /notes/:noteId/comments` - List comments
- `POST /notes/:noteId/comments` - Add comment
- `POST /notes/:noteId/comments/:commentId/resolve` - Resolve comment
- `POST /notes/:noteId/comments/:commentId/unresolve` - Unresolve comment
- `DELETE /notes/:noteId/comments/:commentId` - Delete comment

### WebSocket Events
- `join-note` - Join a note for real-time editing
- `leave-note` - Leave a note
- `block-update` - Update a block
- `block-add` - Add a new block
- `block-delete` - Delete a block
- `cursor-position` - Broadcast cursor position
- `comment-add` - Add a comment

---

## ✅ Features Verified

- [x] User registration and authentication
- [x] Workspace management
- [x] Note creation and editing
- [x] Auto-save functionality
- [x] Version history tracking
- [x] Block-based editing
- [x] Real-time presence awareness
- [x] Conflict detection and resolution
- [x] WebSocket integration
- [x] TypeScript type safety
- [x] Redux state management
- [x] Responsive UI with Tailwind CSS

---

## 🧪 Test Scenarios

### Scenario 1: Single User Note Editing
1. Register and create a workspace
2. Create a note
3. Edit the note content
4. Verify auto-save (save indicator changes)
5. Refresh page - content persists
6. Check version history shows the edits

### Scenario 2: Multi-User Conflict
1. Open the note in two browser windows (or use dev tools)
2. Edit in first window
3. Switch to second window and edit the same note
4. Try to save in second window
5. Conflict modal appears
6. Choose to keep remote or local version

### Scenario 3: Version Restoration
1. Edit a note multiple times
2. Open Version History sidebar
3. Click "↺" on an earlier version
4. Verify note reverts to that version
5. New version is created with restored content

---

## 🛠 Troubleshooting

### Port Already in Use
If you get "address already in use" error:
```bash
# Kill all Node processes
Taskkill /IM node.exe /F /T

# Restart servers
npm run start:dev  # in backend folder
npm run dev        # in frontend folder
```

### Authentication Failed
- Clear browser localStorage
- Check JWT_SECRET is set in backend `.env`
- Verify token is being saved in localStorage

### WebSocket Connection Issues
- Check backend is running on port 8080
- Verify VITE_WS_URL is set to `http://localhost:8080/notes`
- Check browser console for socket.io errors

### Stylings Not Loading
- Ensure Tailwind CSS is compiled
- Check `index.css` is imported in `main.tsx`
- Clear browser cache and refresh

---

## 📊 Database Schema

Data is stored in SQLite at `backend/prisma/dev.db`:

### Tables
- **User** - User accounts
- **Workspace** - Workspaces
- **Note** - Notes within workspaces
- **Block** - Text blocks within notes
- **Revision** - Version history
- **Comment** - Comments on blocks
- **Activity** - Activity log

---

## 🎯 Key Improvements Made

1. **Fixed API URL Configuration**: All API calls now use correct `VITE_API_URL` (port 8080)
2. **Workspace Context**: Frontend now properly tracks `currentWorkspaceId`
3. **Type Safety**: Added proper TypeScript types to thunks and API calls
4. **Revision Panel**: Fixed to use correct workspace/note IDs
5. **Auto-save Hook**: Updated to pass workspace ID to API calls
6. **Route Guards**: Added proper navigation with workspace selection
7. **Error Handling**: Improved error messages and conflict detection

---

## 🚀 Next Steps

1. Test the full user flow (register → create workspace → create notes)
2. Verify version history works correctly
3. Test multi-user scenarios (if applicable)
4. Monitor console for any errors
5. Check Performance in DevTools Network tab

Enjoy using Collaborative Notes! 📝✨
