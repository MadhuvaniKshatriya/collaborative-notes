# Real-Time Collaborative Notes with Conflict Handling

A full-stack collaborative notes application with automatic conflict detection, revision history, real-time search, and smooth autosave experience.

## 🎯 Features

### Core Notes Workflow
- ✅ Create, edit, delete, and browse notes
- ✅ Note ownership/edit metadata (updatedBy, updatedAt timestamps)
- ✅ Full revision history with version tracking
- ✅ Restore notes to previous revisions
- ✅ Note list organization with recent-first sorting
- ✅ Instant access to latest edited note

### Editing Experience
- ✅ Responsive editor with autosave (800ms debounce)
- ✅ Clear save state indicators (idle, unsaved, saving, saved, error, conflict)
- ✅ Prevent accidental data loss on refresh/navigation with unsaved changes
- ✅ Visual feedback for autosave status
- ✅ Block-based editing (paragraph, heading, bullet, checkbox, code)

### Conflict Handling
- ✅ Version-aware writes with conflict detection
- ✅ Clear conflict resolution options (accept local/remote)
- ✅ Conflict context display with local vs remote versions
- ✅ Prevents silent overwrites after conflicts
- ✅ Maintains consistent and auditable revision timeline

### Search & Indexing
- ✅ Efficient in-memory text search across notes
- ✅ Incremental search index updates
- ✅ Real-time search results as you type
- ✅ Index updates on create/edit/delete/restore paths
- ✅ Case-insensitive title and content search

## 🏗️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Redux Toolkit** for state management
- **Tailwind CSS** for styling
- **Vite** for build tooling
- **Lodash** for utilities (debounce)

### Backend
- **NestJS** with TypeScript
- **Prisma** ORM for database
- **SQLite** for persistent storage
- **Express** adapter for HTTP

## 📋 Prerequisites

- Node.js 18+
- npm or pnpm

## 🚀 Setup & Running

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Database Setup

```bash
cd backend
npx prisma db push
```

### 3. Start the Application

**Terminal 1 - Backend (port 5000):**
```bash
cd backend
npm run start:dev
```

**Terminal 2 - Frontend (port 5173):**
```bash
cd frontend
npm run dev
```

### 4. Open in Browser

Navigate to `http://localhost:5173`

## 🗄️ Database Schema

### Note Table
- `id`: UUID primary key
- `title`: Note title
- `blocks`: JSON string of Block[]
- `version`: Version counter (prevents conflicts)
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp
- `updatedBy`: User/system that made last update

### Revision Table (Audit Trail)
- `id`: UUID primary key
- `noteId`: Foreign key to Note
- `blocks`: JSON string of previous blocks (snapshot)
- `version`: Version number at time of revision
- `createdAt`: When revision was created

### Block Structure
```typescript
interface Block {
  id: string;
  type: "paragraph" | "heading" | "bullet" | "checkbox" | "code";
  content: string;
  checked?: boolean;
}
```

## 🔄 Conflict Handling Strategy

### How It Works

1. **Version-Aware Updates**: Client sends current version with update request
2. **Server Validation**: Backend compares client version with current version
3. **Conflict Detection**: If mismatch, return 409 Conflict with error
4. **Conflict Resolution**: Frontend fetches latest version and shows modal
5. **User Choice**: Accept local (keep unsaved changes) or accept remote (fetch latest)

### Revision Persistence

- Before each update, current state is saved to Revision table
- Version number is incremented
- Full history available via RevisionPanel with restore functionality

## 🔍 Search Implementation

### Frontend Search Index
- **Data Structure**: In-memory Map<noteId, searchableText>
- **Updates**: O(1) incremental updates
- **Queries**: O(n) linear scan with case-insensitive matching
- **Complexity**: O(m) space where m = total characters in notes

### Features
- Case-insensitive search
- Searches both title and content
- Updates automatically as notes change
- Fallback to backend search via API

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /notes | Fetch all notes |
| POST | /notes | Create new note |
| GET | /notes/:id | Get single note |
| PATCH | /notes/:id | Update note (conflict detection) |
| DELETE | /notes/:id | Delete note |
| GET | /notes/search?q=query | Search notes |
| GET | /notes/:id/revisions | Get revision history |
| PATCH | /revisions/:revisionId/restore | Restore revision |

## ⚡ Autosave & Request Sequencing

### Debounce Strategy
- **800ms debounce**: Waits 800ms after last edit before saving
- **Prevents thrashing**: Reduces server requests during rapid typing
- **Cleanup**: Cancels pending saves on component unmount

### Version-Based Ordering
- Client tracks current version
- Stale responses are rejected by comparing versions
- Monotonic version increment prevents overwrites

### Save State Machine
```
idle ←→ unsaved → saving → saved
              ↓           ↓
              └─ error ←─┘
              
conflict (special state)
  ↓ (user resolves)
saved
```

## 🧪 Testing Scenarios

### Multi-Client Conflict Test
1. Open app in two browser windows
2. Edit note in Window A, let autosave complete
3. Edit same note in Window B, let autosave complete
4. Edit in Window A again
5. Observe conflict modal with local vs remote
6. Choose resolution option

### Revision Restore Test
1. Create note with initial content
2. Make several edits (each creates revision)
3. Open Revision Panel on right
4. Click "Restore" on earlier version
5. Note content reverts, version increments

## 📊 Performance

### Optimizations
- Debounced autosave: Reduces requests during typing
- Incremental search: O(1) index updates
- Block-level editing: Minimal payloads
- Lazy revision loading: Only fetch when panel opens

### Scaling Considerations
- Search index grows with note content (O(m) space)
- Revisions accumulate (could add cleanup)
- Large notes might benefit from pagination

## 🔐 Concurrency Guarantees

**Strong Guarantees:**
- Monotonic version numbers
- No silent data loss (conflict detection)
- Full audit trail (revisions)
- Ordered updates via versions

**Eventual Consistency:**
- Multiple clients converge after conflicts resolve
- All clients fetch latest after conflict

## 📝 Architecture Highlights

### Frontend
- Redux Toolkit for predictable state management
- Thunks for async operations
- Debounced autosave with conflict detection
- Optimistic UI updates
- Search index for real-time search

### Backend
- NestJS modular architecture
- Prisma for type-safe database access
- Version-based concurrency control
- Full revision audit trail
- Clear separation of concerns

## 🔗 API Behavior

### Update Conflict Example

**Request:**
```json
{
  "title": "My Note",
  "blocks": [...],
  "version": 3,
  "updatedBy": "user"
}
```

**Response (Conflict - 409):**
```json
{
  "statusCode": 409,
  "message": "Version conflict: expected 4, got 3"
}
```

**Client Action:**
1. Fetch latest version
2. Show conflict modal
3. User resolves by accepting local or remote

## 🚀 Production Checklist

- [ ] Add user authentication
- [ ] Implement WebSocket for real-time collaboration
- [ ] Add database backups
- [ ] Set up monitoring/logging
- [ ] Add rate limiting
- [ ] Implement soft deletes for recovery
- [ ] Add admin panel for content moderation
- [ ] Set up CI/CD pipeline
- [ ] Add E2E tests
- [ ] Deploy to production server

## 📄 License

MIT

---

Built with ❤️ for seamless collaborative note-taking