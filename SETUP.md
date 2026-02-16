# Setup Instructions

## Quick Start (5 minutes)

### Prerequisites
- Node.js 18+ installed
- npm or pnpm available
- Terminal/PowerShell access

### Step-by-Step

1. **Clone/Extract Repository**
   ```bash
   cd collaborative-notes
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Setup Database**
   ```bash
   npx prisma db push
   ```

4. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

5. **Start Backend (Terminal 1)**
   ```bash
   cd backend
   npm run start:dev
   ```
   
   Wait for: `[NestApplication] Nest application successfully started`

6. **Start Frontend (Terminal 2)**
   ```bash
   cd frontend
   npm run dev
   ```
   
   Wait for: `➜ Local: http://localhost:5173/`

7. **Open Browser**
   - Navigate to http://localhost:5173
   - App should load with empty notes list
   - Click "+ New Note" to create first note

## Troubleshooting

### Port Already in Use

**Backend (5000):**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

**Frontend (5173):**
```bash
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5173
kill -9 <PID>
```

### Database Issues

**Reset Database:**
```bash
cd backend
rm dev.db dev.db-journal  # Remove old database
npx prisma db push        # Create fresh database
```

**Check Database:**
```bash
cd backend
npx prisma studio   # Opens GUI at http://localhost:5555
```

### Build Errors

**Clear node_modules and reinstall:**
```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## Development

### Backend Development
```bash
cd backend
npm run start:dev    # Watch mode with auto-reload
npm run build        # Compile TypeScript
npm run test         # Run tests (if configured)
```

### Frontend Development
```bash
cd frontend
npm run dev          # Dev server with HMR
npm run build        # Production build
npm run preview      # Preview production build
```

### Database Management
```bash
cd backend

# Apply migrations
npx prisma migrate dev --name <migration_name>

# Rollback to previous state
npx prisma migrate resolve --rolled-back <migration_name>

# View database UI
npx prisma studio
```

## Project Structure

```
collaborative-notes/
├── backend/
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── modules/
│   │   │   ├── notes/
│   │   │   │   ├── notes.controller.ts
│   │   │   │   ├── notes.service.ts
│   │   │   │   ├── notes.module.ts
│   │   │   │   ├── dto/
│   │   │   │   │   ├── create-note.dto.ts
│   │   │   │   │   ├── update-note.dto.ts
│   │   │   │   │   └── search-note.dto.ts
│   │   │   │   └── types/
│   │   │   │       └── block.type.ts
│   │   │   └── revisions/
│   │   │       ├── revisions.controller.ts
│   │   │       ├── revisions.service.ts
│   │   │       └── revisions.module.ts
│   │   └── prisma/
│   │       ├── prisma.module.ts
│   │       └── prisma.service.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── package.json
│   ├── tsconfig.json
│   └── nest-cli.json
│
├── frontend/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── index.css
│   │   ├── app/
│   │   │   └── store.ts
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── EditorLayout.tsx
│   │   │   │   └── Sidebar.tsx
│   │   │   ├── notes/
│   │   │   │   ├── NoteEditor.tsx
│   │   │   │   ├── NotesList.tsx
│   │   │   │   ├── BlockEditor.tsx
│   │   │   │   ├── RevisionPanel.tsx
│   │   │   │   ├── ConflictModal.tsx
│   │   │   │   └── SaveIndicator.tsx
│   │   │   └── search/
│   │   │       └── SearchBar.tsx
│   │   ├── features/notes/
│   │   │   ├── notesSlice.ts
│   │   │   ├── notesThunk.ts
│   │   │   ├── notesApi.ts
│   │   │   ├── searchIndex.ts
│   │   │   ├── types.ts
│   │   │   └── selectors.ts
│   │   └── hooks/
│   │       ├── useAutosave.ts
│   │       ├── useBeforeUnloadGuard.ts
│   │       └── useRequestSequencer.ts
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── index.html
│
├── README.md
└── SETUP.md (this file)
```

## Environment Variables

### Backend (.env)
```
DATABASE_URL="file:./dev.db"
NODE_ENV=development
PORT=5000
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000
```

Both are optional - defaults work for local development.

## Performance Tips

1. **Backend**: Use `npm run start:dev` for development (watch mode)
2. **Frontend**: Vite is already highly optimized with HMR
3. **Database**: Use `npx prisma studio` to inspect data during testing
4. **Search**: Search index built incrementally - very fast

## Deployment Preparation

### Backend (Node/Express)

1. Set `NODE_ENV=production`
2. Build: `npm run build`
3. Start: `npm run start` (production start)
4. Use process manager (PM2, systemd, etc.)

### Frontend (Static)

1. Build: `npm run build`
2. Outputs to `dist/` folder
3. Serve with any static hosting (Vercel, Netlify, etc.)
4. Update `VITE_API_URL` for production API

## Testing Workflows

### Create Note Test
1. Click "+ New Note"
2. Type title and content
3. Wait for "Saved" indicator
4. Note appears in list

### Edit & Autosave Test
1. Click note in list to edit
2. Type in editor
3. Status shows "Unsaved"
4. Wait 800ms, status changes to "Saving"
5. Status shows "Saved" (note: appears quickly after)

### Conflict Test
1. Open app in two browser windows
2. Create note in Window A
3. Edit in Window A, let autosave finish
4. Edit in Window B, let autosave finish
5. Edit in Window A again
6. Trigger save in Window A - should show conflict modal

### Search Test
1. Create multiple notes with distinct content
2. Type in search bar
3. Results filter in real-time
4. Clear search - all notes reappear

### Revision Test
1. Create note, let autosave
2. Edit and autosave (creates revision)
3. Edit again and autosave
4. Open Revision Panel (right sidebar)
5. Click "Restore" on earlier revision
6. Note content reverts, version increments

## Getting Help

- Check backend logs for API errors
- Check browser console for frontend errors
- Verify database with `npx prisma studio`
- Ensure both services are running on correct ports
- Check package.json versions match expected

## Next Steps

1.  App is running locally
2. Create some test notes
3. Test conflict handling with two windows
4. Explore revision history
5. Read CONFLICT_STRATEGY.md for detailed conflict info
6. Deploy to production (optional)

---

**Happy note-taking! **
