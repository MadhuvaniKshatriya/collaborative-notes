# Setup & Deployment Guide

## Quick Start (5 Minutes)

### Prerequisites
- Node.js 18+ with npm/pnpm
- SQLite (included in package)
- Two terminal windows

### Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Initialize database
npx prisma migrate dev --name enterprise_schema

# Start development server
npm run start:dev
```

Expected output:
```
[Nest] 12345  - 01/01/2025, 12:00:00 PM     LOG [NestFactory] Starting Nest application...
[Nest] 12345  - 01/01/2025, 12:00:00 PM     LOG [NestApplication] Nest application successfully started
🚀 Server is running on http://localhost:5000
```

### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Create environment configuration
echo "VITE_API_URL=http://localhost:5000" > .env.local
echo "VITE_WS_URL=http://localhost:5000/notes" >> .env.local

# Start dev server
npm run dev
```

Expected output:
```
VITE v7.3.1  local:   http://localhost:5173/
            press h + enter to show help
```

### Access the Application
Open browser to: **http://localhost:5173**

---

## Detailed Setup

### Backend Configuration

#### 1. Environment Setup
Create `.env` in `/backend`:
```env
# Database
DATABASE_URL="file:./prisma/dev.db"

# Authentication
JWT_SECRET="your-super-secret-key-change-this-in-production"
JWT_EXPIRATION="15m"

# Server
NODE_ENV="development"
PORT=5000

# Frontend URLs (for CORS)
FRONTEND_URLS="http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174,http://localhost:5175,http://127.0.0.1:5175,http://localhost:5176,http://127.0.0.1:5176"
```

#### 2. Install Dependencies
```bash
npm install
```

Dependencies added in this upgrade:
- **bcrypt** - Password hashing
- **@nestjs/jwt** - JWT authentication
- **passport-jwt** - JWT strategy
- **@nestjs/passport** - Passport integration
- **class-validator** - DTO validation
- **class-transformer** - DTO transformation
- **@nestjs/config** - Configuration management
- **socket.io** - WebSocket server
- **@nestjs/platform-socket.io** - NestJS WebSocket adapter
- **@nestjs/websockets** - WebSocket module

#### 3. Initialize Database
```bash
npx prisma migrate dev --name enterprise_schema
```

This will:
- Create SQLite database at `prisma/dev.db`
- Run migration SQL creating 9 tables
- Generate Prisma client

**Tables created:**
- `User` - User accounts
- `Workspace` - Multi-tenant workspaces
- `WorkspaceMember` - Workspace membership with roles
- `Note` - Notes within workspaces
- `Block` - Individual blocks within notes
- `Revision` - Version history
- `Comment` - Comments on blocks
- `Activity` - Audit log
- `Session` - Active connections

#### 4. Start Development Server
```bash
npm run start:dev
```

Server will:
- Listen on port 5000
- Enable hot-reload
- Expose WebSocket on `/notes`
- Setup CORS for frontend

### Frontend Configuration

#### 1. Environment Setup
Create `.env.local` in `/frontend`:
```env
VITE_API_URL=http://localhost:5000
VITE_WS_URL=http://localhost:5000/notes
```

#### 2. Install Dependencies
```bash
npm install
```

Dependencies added:
- **react-router-dom** - Client-side routing
- **socket.io-client** - WebSocket client

#### 3. Start Development Server
```bash
npm run dev
```

Frontend will:
- Build with Vite
- Hot-reload on code changes
- Open to http://localhost:5173

---

## Verifying Installation

### 1. Backend Health Check
```bash
curl http://localhost:5000/
```

Expected response: `{"message":"Hello from the server!"}`

### 2. Login Endpoint Check
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

Expected response: 401 Unauthorized (user not found)

### 3. WebSocket Check
Open browser DevTools → Network → WS:
- Should see WebSocket connection to `ws://localhost:5000/Socket.IO`
- Status: `101 Switching Protocols`

### 4. Frontend Access
Open http://localhost:5173 in browser:
- Should see login page
- Redirect to `/login` if not authenticated

---

## First-Time Usage

### Create Account
1. Click "Don't have an account? Register here"
2. Fill in:
   - Email: `user1@example.com`
   - Username: `user1`
   - Password: (choose one)
   - Confirm: (repeat)
3. Click "Register"
4. Auto-logged in to default workspace

### Create First Note
1. Click "+ New Note"
2. Enter title: "My First Note"
3. Press Tab to activate editor
4. Start typing

### Test Multi-User Collaboration
1. **User 1**: Open http://localhost:5173 (existing)
2. **User 2**: Open http://localhost:5174 (new port or incognito)
3. Both register different accounts
4. Navigate to same workspace
5. Edit same note in both windows
6. See real-time updates

---

## Database Management

### View Data (Prisma Studio)
```bash
cd backend
npx prisma studio
```

Opens interactive UI at http://localhost:5555 showing:
- All tables and records
- Create/edit/delete data
- Query builder

### Reset Database (Development Only)
```bash
cd backend
npx prisma migrate reset
```

⚠️ **WARNING**: Deletes all data. Use only in development.

### Create Backup
```bash
# SQLite can be backed up as a regular file
cp backend/prisma/dev.db backend/prisma/dev.db.backup
```

### Inspect Schema
```bash
cd backend
npx prisma introspect
```

---

## Troubleshooting

### "Port 5000 already in use"
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

Or change PORT in `.env`

### "Cannot find module 'bcrypt'"
```bash
cd backend
npm install bcrypt
npm run build
```

### WebSocket not connecting
1. Verify backend server is running
2. Check FRONTEND_URLS in `.env` includes your frontend URL
3. Open DevTools → Console for errors
4. Check VITE_WS_URL in frontend `.env.local`

### Database locked error
```bash
# Close Prisma Studio if open
# Kill any node processes
# Try again
```

### "User not found" on login
First create an account via registration page, then login.

### Changes not reflecting in UI
1. Check browser console for errors
2. Verify both servers are running
3. Hard refresh browser (Ctrl+Shift+R)
4. Check network tab for failed requests

---

## Development Workflows

### Adding a New Workspace Feature

#### 1. Database Schema
Edit `backend/prisma/schema.prisma`:
```prisma
model MyNewModel {
  id        String @id @default(cuid())
  workspaceId String
  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  // ... fields
}
```

#### 2. Create Migration
```bash
cd backend
npx prisma migrate dev --name add_my_feature
```

#### 3. Implement Backend
```typescript
// module/my-feature/my-feature.service.ts
@Injectable()
export class MyFeatureService {
  constructor(private prisma: PrismaService) {}
  
  async create(workspaceId: string, data: any) {
    return this.prisma.myNewModel.create({
      data: { ...data, workspaceId }
    });
  }
}
```

#### 4. Add API Endpoint
```typescript
@Controller('workspaces/:workspaceId/my-feature')
export class MyFeatureController {
  constructor(private service: MyFeatureService) {}
  
  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Param('workspaceId') workspaceId: string, @Body() dto: any) {
    return this.service.create(workspaceId, dto);
  }
}
```

#### 5. Update Frontend
```typescript
// features/my-feature/myFeatureApi.ts
export function fetchMyFeature(workspaceId: string) {
  return fetch(`${API_URL}/workspaces/${workspaceId}/my-feature`, {
    headers: getAuthHeaders()
  }).then(r => r.json());
}
```

---

## Production Deployment

### Environment Setup
Update `.env`:
```env
NODE_ENV=production
DATABASE_URL="postgresql://user:password@host/dbname"
JWT_SECRET="$(openssl rand -base64 32)"
PORT=8080
FRONTEND_URLS="https://yourdomain.com"
```

### Database Migration
```bash
# On production server
npx prisma migrate deploy
```

### Build Backend
```bash
cd backend
npm run build
npm run start
```

### Build Frontend
```bash
cd frontend
npm run build
```

Generates `dist/` folder for static hosting.

### Deploy with Docker (Optional)

#### Backend Dockerfile
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY backend .
RUN npm install
RUN npx prisma generate
RUN npm run build
EXPOSE 5000
CMD ["npm", "run", "start"]
```

#### Build & Run
```bash
docker build -t collab-notes-backend .
docker run -p 5000:5000 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="..." \
  collab-notes-backend
```

### Configure Reverse Proxy (Nginx)
```nginx
server {
  listen 80;
  server_name api.yourdomain.com;

  location / {
    proxy_pass http://localhost:5000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
}
```

---

## Performance Tuning

### Backend Optimization
```typescript
// Enable caching
const cache = new CacheModule.register({
  ttl: 300, // 5 minutes
  max: 1000
});

// Database indexes are already configured
// See prisma/schema.prisma for @@index directives
```

### Frontend Optimization
```typescript
// Use React.memo for expensive components
export const BlockEditor = React.memo(BlockEditorComponent);

// Code splitting with lazy loading
const CommentsPanel = lazy(() => import('./CommentsPanel'));

// Image optimization
import { Image } from './Image'; // Already optimized
```

### WebSocket Tuning
```typescript
// Adjust in notes.gateway.ts
const socketIoOptions = {
  cors: { origin: process.env.FRONTEND_URLS },
  transports: ['websocket', 'polling'],
  pingInterval: 25000,
  pingTimeout: 60000,
};
```

---

## Monitoring & Logging

### Backend Logs
```bash
# View logs in console
npm run start:dev

# Or write to file
npm run start:dev > logs/server.log 2>&1
```

### Frontend Errors
Open DevTools → Console to see:
- API errors
- WebSocket issues
- Redux state changes

### Database Queries
Enable query logging in `.env`:
```env
# Prisma query logging (development only)
DEBUG="prisma:client"
```

---

## Updating Dependencies

### Check for updates
```bash
npm outdated
```

### Update specific package
```bash
npm update package-name@latest
```

### Update all packages
```bash
npm update
```

### Major version update
```bash
npm install package-name@latest
```

---

## Backup & Recovery

### Backup Database
```bash
# SQLite
cp backend/prisma/dev.db backup/dev.db.$(date +%Y%m%d-%H%M%S)

# PostgreSQL
pg_dump dbname > backup/db-$(date +%Y%m%d).sql
```

### Restore from Backup
```bash
# SQLite
cp backup/dev.db.YYYYMMDD-HHMMSS backend/prisma/dev.db

# PostgreSQL
psql dbname < backup/db-YYYYMMDD.sql
```

### Restore Previous Version (Git)
```bash
git log --oneline
git checkout <commit-hash>
npm install
npx prisma migrate deploy
```

---

## Security Checklist

Before deploying to production:

- [ ] Change JWT_SECRET to random 32+ character string
- [ ] Enable HTTPS/SSL
- [ ] Restrict CORS to specific domain
- [ ] Setup rate limiting
- [ ] Enable database encryption at rest
- [ ] Configure firewall rules
- [ ] Setup automated backups
- [ ] Enable password hashing verification
- [ ] Use environment variables (never hardcode secrets)
- [ ] Enable CSRF protection
- [ ] Setup error logging (Sentry, etc.)
- [ ] Configure WAF (Web Application Firewall)
- [ ] Enable SQL query logging and monitoring
- [ ] Setup DDoS protection
- [ ] Regular security audits

---

## Support & Resources

### Documentation
- [NestJS Docs](https://docs.nestjs.com)
- [Prisma Docs](https://www.prisma.io/docs)
- [React Docs](https://react.dev)
- [Redux Docs](https://redux.js.org)
- [Socket.IO Docs](https://socket.io/docs)

### Common Issues
- See "Troubleshooting" section above
- Check GitHub Issues for similar problems
- Review NestJS + Prisma documentation

### Getting Help
1. Check error messages in console
2. Enable debug logging
3. Review network requests in DevTools
4. Check database with Prisma Studio
5. Create minimal reproduction case

---

## Next Steps

After successful setup:

1. **Explore the Code** - Review architecture and module structure
2. **Create Test Data** - Register multiple users, create workspaces
3. **Test Collaboration** - Open multiple browser windows, edit simultaneously
4. **Review Security** - Audit JWT implementation, database access patterns
5. **Plan Deployment** - Choose hosting platform (Vercel, Heroku, AWS, etc.)
6. **Customize UI** - Adjust colors, fonts, layout to match brand
7. **Add Features** - Comments panel, activity log, typing indicators
8. **Performance Test** - Use load testing tools to verify scaling
9. **Security Audit** - Review for vulnerabilities before production
10. **Deploy** - Follow production deployment guide

Happy building! 🚀

