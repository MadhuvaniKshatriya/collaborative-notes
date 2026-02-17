# Quick Reference Guide

## 🚀 Start Here

### First Time Setup (5 minutes)
```bash
# Terminal 1: Backend
cd backend
npm install
npx prisma migrate dev --name enterprise_schema
npm run start:dev

# Terminal 2: Frontend
cd frontend
npm install
echo "VITE_API_URL=http://localhost:5000" > .env.local
echo "VITE_WS_URL=http://localhost:5000/notes" >> .env.local
npm run dev
```

**Result**: App running at `http://localhost:5173`

---

## 📚 Documentation Map

### For Understanding the Architecture
→ Read: **ARCHITECTURE.md** (205 lines)
- Design decisions
- Module structure
- Security approach
- Scalability path

### For Setting Up (Local or Production)
→ Read: **SETUP_AND_DEPLOY.md** (400 lines)
- Step-by-step local setup
- Environment configuration
- Database management
- Production deployment

### For Testing Everything
→ Read: **TESTING_GUIDE.md** (600 lines)
- 40+ test scenarios
- Step-by-step verification
- Acceptance criteria
- Performance tests

### For Feature Summary
→ Read: **IMPLEMENTATION_COMPLETE.md** (350 lines)
- What was built
- Each module explained
- API endpoints
- File structure

### For Project Status
→ Read: **PROJECT_COMPLETION_SUMMARY.md** (500 lines)
- Implementation summary
- Feature checklist
- Metrics & statistics
- Roadmap

---

## 🔑 Key Commands

### Backend
```bash
# Development
cd backend
npm run start:dev              # Start server (port 5000)
npm run build                  # Build for production
npm run test                   # Run tests
npx prisma studio             # View database (port 5555)
npx prisma migrate dev        # Create new migration

# Database
npx prisma migrate deploy     # Run migrations (production)
npx prisma migrate reset      # Reset database (dev only)
npx prisma db seed            # Seed with test data
```

### Frontend
```bash
# Development
cd frontend
npm run dev                    # Start dev server (port 5173)
npm run build                  # Build for production
npm run preview               # Preview production build
npm run test                  # Run tests
npm run lint                  # Check code quality
```

---

## 🏗️ Project Structure

### Backend Modules
```
auth/          → User registration, login, JWT tokens
workspace/     → Multi-tenant workspaces, member roles
notes/         → Note CRUD, blocks, versions, search
comments/      → Comments, threads, resolution
activity/      → Audit trail, action logging
gateway/       → WebSocket real-time events
prisma/        → Database abstraction layer
```

### Frontend Features
```
auth/          → Login, register, authentication
workspace/     → Workspace switching, selection
notes/         → Note list, editor, revisions
collaboration/ → Presence, comments, activity
```

---

## 🔒 Authentication

### User Flows

**Registration**:
```
/register → User fills form → API POST /auth/register → JWT token returned
```

**Login**:
```
/login → User enters credentials → API POST /auth/login → JWT token returned
```

**Protected Routes**:
```
Any protected route → Check token in localStorage → Redirect to /login if missing
```

### JWT Tokens
```
Expiry: 15 minutes
Storage: localStorage (key: 'authToken')
Header: Authorization: Bearer <token>
```

---

## 💾 Database Schema (Quick View)

### 10 Models
```
User                    Workspace              WorkspaceMember
├─ id (PK)              ├─ id (PK)             ├─ workspaceId (FK)
├─ email (unique)       ├─ name                ├─ userId (FK)
├─ username (unique)    ├─ description         └─ role (enum)
├─ passwordHash         ├─ ownerId (FK)
└─ avatar               └─ createdAt

Note                    Block                  Revision
├─ id (PK)              ├─ id (PK)             ├─ id (PK)
├─ workspaceId (FK)     ├─ noteId (FK)         ├─ noteId (FK)
├─ title                ├─ type (enum)         ├─ blocks (JSON)
├─ version              ├─ content             ├─ version
├─ shareToken           ├─ createdBy (FK)      ├─ createdBy (FK)
└─ createdAt            ├─ lastEditedBy (FK)   └─ createdAt
                        └─ version

Comment                 Activity                Session
├─ id (PK)              ├─ id (PK)             ├─ id (PK)
├─ noteId (FK)          ├─ workspaceId (FK)    ├─ userId (FK)
├─ blockId (FK)         ├─ userId (FK)         ├─ workspaceId (FK)
├─ content              ├─ noteId (FK)         ├─ noteId (FK)
├─ resolved             ├─ actionType (enum)   ├─ socketId
└─ createdAt            ├─ metadata (JSON)     └─ createdAt
                        └─ createdAt
```

---

## 🌐 API Endpoints (Quick Reference)

### Auth (No auth required)
```
POST   /auth/register              { email, username, password }
POST   /auth/login                 { email, password }
```

### Workspaces (Requires JWT)
```
GET    /workspaces                 List all workspaces
POST   /workspaces                 { name, description }
GET    /workspaces/:id             Get workspace details
POST   /workspaces/:id/members/:memberId
DELETE /workspaces/:id/members/:memberId
```

### Notes (Requires JWT)
```
GET    /workspaces/:wId/notes
POST   /workspaces/:wId/notes       { title, blocks }
GET    /workspaces/:wId/notes/:id
PATCH  /workspaces/:wId/notes/:id   { title, blocks }
DELETE /workspaces/:wId/notes/:id

GET    /workspaces/:wId/notes/:id/revisions
POST   /workspaces/:wId/notes/:id/revisions/:rId/restore
POST   /workspaces/:wId/notes/:id/share
GET    /share/:token                (No auth required)
```

### Comments (Requires JWT)
```
GET    /notes/:noteId/comments
POST   /notes/:noteId/comments       { content, blockId? }
POST   /notes/:noteId/comments/:cId/resolve
POST   /notes/:noteId/comments/:cId/unresolve
DELETE /notes/:noteId/comments/:cId
```

---

## 📡 WebSocket Events (Socket.IO)

### Client → Server
```
join-note         { noteId, userId }
leave-note        { noteId }
block-update      { blockId, content, version }
block-add         { type, position, content }
block-delete      { blockId, version }
cursor-position   { blockId, position }
comment-add       { content, blockId? }
comment-resolve   { commentId }
```

### Server → Client
```
user-joined       { userId, userName, avatar }
user-left         { userId }
block-updated     { blockId, content, editedBy, timestamp }
block-added       { block }
block-deleted     { blockId }
cursor-moved      { userId, blockId, position }
comment-added     { comment }
comment-resolved  { commentId }
error             { message, code }
conflict          { conflictedBlockId, latestVersion }
```

---

## 🔧 Common Tasks

### Create a Note
```bash
curl -X POST http://localhost:5000/workspaces/{wId}/notes \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"My Note",
    "blocks":[{"type":"PARAGRAPH","content":"Hello"}]
  }'
```

### Edit a Block
```
Frontend: User types in editor → useWebSocketConnection sends block-update event
Backend: Gateway receives → Updates database → Broadcasts to room
Frontend: Other users receive update → Redux state updates → UI re-renders
```

### Add a Comment
```
Frontend: Click comment button → Click "Add comment" → Type → Click Post
Backend: POST /notes/:noteId/comments → Create Comment record → Emit via WebSocket
Frontend: All connected users receive comment-added event → UI updates
```

### Restore Previous Version
```
Frontend: Click Revision panel → Select old revision → Click "Restore"
Backend: POST /revisions/:rId/restore → Create new revision → Update blocks
Frontend: Note reverts to selected version → Activity logged
```

---

## 🧪 Testing Quick Checklist

### Essential Tests
- [ ] Register → Login → Logout flow works
- [ ] Create workspace → Add members → Switch workspace
- [ ] Create note → Edit blocks → Save and refresh
- [ ] Open same note in 2 browsers → Edit → See real-time updates
- [ ] Add comment → See in all browsers → Resolve comment
- [ ] Restore previous version → See new revision
- [ ] Check activity log shows all actions
- [ ] Logout → Try to access protected route → Redirects to login

### Performance Tests
- [ ] Load note with 50 blocks → Smooth scrolling
- [ ] Edit 5+ blocks in real-time → No lag
- [ ] Search 100+ notes → Results in < 500ms
- [ ] Load presence bar with 10+ active users

---

## 🆘 Troubleshooting

### "Cannot connect to backend"
```bash
# Check backend is running
curl http://localhost:5000/

# Check port 5000 not in use
netstat -ano | findstr :5000

# Verify CORS in .env
# Should include http://localhost:5173
```

### "WebSocket connection failed"
```bash
# Check Socket.IO server listening
# Look for: "🚀 WebSocket server listening"

# Check frontend .env.local has WS URL
cat frontend/.env.local

# Check FRONTEND_URLS in backend .env
```

### "Authentication token invalid"
```bash
# Check localStorage has authToken
# DevTools → Application → LocalStorage

# Check token not expired (15 min)

# Try login again
```

### "Database locked"
```bash
# Close Prisma Studio if open
# Kill any node processes
# Try again
```

---

## 📊 Feature Status Dashboard

```
✅ Authentication          Production Ready
✅ Workspaces              Production Ready
✅ Notes & Blocks          Production Ready
✅ WebSocket               Production Ready
✅ Presence                Production Ready
✅ Comments                Production Ready
✅ Revisions               Production Ready
✅ Activity Log             Production Ready
✅ Share Links             Production Ready
🟡 Comments UI             Component Ready
🟡 Activity UI             Component Ready
🟡 E2E Tests              Ready for Implementation
⏳ Dark Mode               Planned
⏳ Offline Support         Planned
⏳ Mobile App              Planned
```

---

## 📈 Performance Targets

```
Backend Response:       < 100ms (99th percentile)
WebSocket Latency:      < 50ms
Page Load:              < 2 seconds
Search (100 notes):     < 500ms
Concurrent Users:       5+ simultaneous editors
Database Size:          Unlimited (with PostgreSQL)
```

---

## 🔐 Security Checklist

### Development
- [x] JWT tokens enabled
- [x] Passwords hashed with bcrypt
- [x] CORS configured
- [x] Input validation on all DTOs
- [x] Role-based access control
- [x] WebSocket security headers

### Before Production
- [ ] Change JWT_SECRET
- [ ] Switch to PostgreSQL
- [ ] Enable HTTPS
- [ ] Setup rate limiting
- [ ] Configure firewall
- [ ] Enable backup encryption
- [ ] Setup error logging (Sentry, etc.)

---

## 📞 Help & Resources

### Documentation Files
- `ARCHITECTURE.md` - Technical design
- `SETUP_AND_DEPLOY.md` - Setup guide
- `TESTING_GUIDE.md` - Test procedures
- `IMPLEMENTATION_COMPLETE.md` - Feature summary
- `PROJECT_COMPLETION_SUMMARY.md` - Project overview

### External Resources
- [NestJS Docs](https://docs.nestjs.com)
- [Prisma Docs](https://www.prisma.io/docs)
- [React Docs](https://react.dev)
- [Redux Docs](https://redux.js.org)
- [Socket.IO Docs](https://socket.io/docs)

### Common Commands Reference
See "🔧 Common Tasks" and "🔧 Common Tasks" sections above

---

## 🎯 Next Steps

### To Deploy to Production
1. Read: `SETUP_AND_DEPLOY.md` → Production section
2. Update: `.env` with real values
3. Run: Database migrations
4. Test: All acceptance criteria from `TESTING_GUIDE.md`
5. Deploy: Using your chosen hosting platform

### To Add New Features
1. Read: `ARCHITECTURE.md` for patterns
2. Create: New module folder
3. Implement: Service, Controller, Module
4. Add: Routes to app.module.ts
5. Test: Using test scenarios

### To Debug Issues
1. Check: Browser DevTools Console
2. Check: Backend logs (terminal)
3. Check: Network tab (API calls)
4. Check: Prisma Studio (database)
5. Search: Error message in documentation

---

## 💡 Pro Tips

### Development
- Use Redux DevTools browser extension for state debugging
- Use Prisma Studio for database exploration
- Use Network tab to inspect WebSocket messages
- Use VS Code REST Client for API testing

### Performance
- Keep JWT_EXPIRATION low (15m default)
- Use database indexes (already configured)
- Implement pagination for large lists
- Cache workspace list in Redux

### Security
- Never commit `.env` files
- Rotate JWT_SECRET regularly
- Use HTTPS in production
- Validate all inputs (DTOs do this)

---

**Last Updated**: January 16, 2025
**Quick Reference Version**: 1.0
**Status**: Complete ✅

Start with "Start Here" → Follow Documentation Map → Use Quick Reference!

