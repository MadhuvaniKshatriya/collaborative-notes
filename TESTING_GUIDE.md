# Comprehensive Testing Guide

## Test Scenarios & Verification Steps

This guide provides step-by-step testing procedures to verify all features of the enterprise collaborative notes application.

---

## Module 1: Authentication & Authorization

### Test 1.1: User Registration
**Objective**: Verify user can create account with validation

**Steps**:
1. Navigate to `/register`
2. Leave email blank, try to submit
   - Expected: Form validation error
3. Enter email: `testuser1@example.com`
4. Leave username blank, try to submit
   - Expected: Form validation error
5. Enter username: `testuser1`
6. Leave password blank, try to submit
   - Expected: Form validation error
7. Enter password: `TestPassword123!`
8. Leave confirm password blank, try to submit
   - Expected: Form validation error
9. Enter confirm password: `TestPassword123!`
10. Click Register
    - Expected: Success message, redirect to workspace
    - Check localStorage: `authToken` and `user` objects present

**Verification Points**:
-   Email validation (format check)
-   Username uniqueness
-   Password strength requirements
-   Password confirmation match
-   JWT token generation and storage
-   User creation in database

**API Call to Verify**:
```bash
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"testuser1@example.com",
    "username":"testuser1",
    "password":"TestPassword123!"
  }'
```

Expected response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "cl...",
    "email": "testuser1@example.com",
    "username": "testuser1"
  }
}
```

---

### Test 1.2: User Login
**Objective**: Verify existing user can login

**Steps**:
1. Navigate to `/login`
2. Enter email: `testuser1@example.com`
3. Enter password: `TestPassword123!`
4. Click Login
   - Expected: Success, redirect to workspaces page
5. Check localStorage for token

**Verification Points**:
-   Credentials validated correctly
-   JWT token generated
-   Token stored in localStorage
-   Redirect to workspaces page

**Error Cases**:
1. Wrong password → "Invalid credentials"
2. Non-existent email → "Invalid credentials"
3. Empty fields → Validation error

---

### Test 1.3: Protected Routes
**Objective**: Verify unauthenticated users can't access protected routes

**Steps**:
1. Clear localStorage (delete authToken)
2. Try to navigate to `/workspaces`
   - Expected: Redirect to `/login`
3. Try to access `/workspaces/123` directly
   - Expected: Redirect to `/login`
4. Verify navigation menu only shows login/register buttons

---

### Test 1.4: Logout
**Objective**: Verify user logout clears session

**Steps**:
1. Login with `testuser1@example.com`
2. Click logout button (top-right corner)
   - Expected: Redirect to `/login`
3. Check localStorage
   - Expected: `authToken` cleared, `user` cleared
4. Try to access `/workspaces`
   - Expected: Redirect to `/login`

---

## Module 2: Workspace Management

### Test 2.1: Create Workspace
**Objective**: Verify user can create new workspace

**Steps**:
1. Login with first user (`testuser1`)
2. Navigate to `/workspaces`
3. Click "+ New Workspace"
4. Fill in form:
   - Name: `Team Project`
   - Description: `Test workspace for team collaboration`
5. Click Create
   - Expected: New workspace appears in list
   - Expected: User auto-added as OWNER

**Verification Points**:
-   Workspace created in database
-   User role set to OWNER
-   Workspace appears in workspace list
-   Default note created (or empty state)

---

### Test 2.2: List Workspaces
**Objective**: Verify user sees their workspaces

**Steps**:
1. Create 3 workspaces:
   - `Project A`
   - `Project B`
   - `Shared Project`
2. Navigate to `/workspaces`
   - Expected: All 3 workspaces shown as cards
3. Each card shows:
   - Workspace name
   - Description
   - Owner name
   - Member count
   - Create/join date

---

### Test 2.3: Switch Workspace
**Objective**: Verify user can switch between workspaces

**Steps**:
1. Login with `testuser1`
2. Open workspace dropdown (top-left)
3. See all user's workspaces listed
4. Click `Project A`
   - Expected: Content changes to Project A
   - Expected: URL changes to `/workspaces/{projectA_id}`
5. Click `Project B`
   - Expected: Content changes to Project B

**Verification Points**:
-   Workspace switcher dropdown functional
-   Correct workspace loaded after switch
-   Notes list updates for new workspace

---

### Test 2.4: Add Members to Workspace
**Objective**: Verify workspace owner can add members

**Steps**:
1. Create second user: `testuser2@example.com` / `testuser2`
2. Login as `testuser1`
3. Open workspace: `Team Project`
4. Click "Invite Members" (settings icon)
5. Enter: `testuser2`
6. Click Add Member
   - Expected: testuser2 appears in members list
   - Expected: Default role: EDITOR

**Verification Points**:
-   Member added to WorkspaceMember table
-   Member can access workspace
-   Role correctly set

**Verify Member Access**:
1. Logout (clear localStorage)
2. Login as `testuser2`
3. Navigate to `/workspaces`
4. `Team Project` appears in list
5. Can open and edit notes

---

### Test 2.5: Member Roles & Permissions
**Objective**: Verify role-based access control

**Scenario 1: OWNER**
-   Can create notes
-   Can edit notes
-   Can delete notes
-   Can invite/remove members
-   Can change member roles

**Scenario 2: ADMIN**
-   Can create notes
-   Can edit notes
-   Can delete notes
-   Can invite/remove members
-   Cannot change workspace settings

**Scenario 3: EDITOR**
-   Can create notes
-   Can edit notes
-   Can delete notes
-   Cannot invite members
-   Cannot delete other's notes

**Scenario 4: VIEWER**
-   Can view notes
-   Cannot create notes
-   Cannot edit notes
-   Cannot delete notes

**Test Steps**:
1. Create workspace with `testuser1` (OWNER)
2. Add `testuser2` as EDITOR, `testuser3` as VIEWER
3. Create note as OWNER
4. Login as EDITOR, verify can edit
5. Login as VIEWER, verify cannot edit (button disabled)

---

## Module 3: Notes & Blocks

### Test 3.1: Create Note
**Objective**: Verify user can create new note

**Steps**:
1. Login as `testuser1` in `Team Project` workspace
2. Click "+ New Note"
3. Enter title: `Meeting Notes - Jan 15`
4. Press Enter
   - Expected: Note created with empty paragraph block
   - Expected: Note appears in sidebar list
   - Expected: Editor opens with focus in block

**Verification Points**:
-   Note created with workspaceId
-   Default paragraph block created
-   Block order set to 0
-   CreatedBy and lastEditedBy set to current user
-   Version = 1

---

### Test 3.2: Edit Block Content
**Objective**: Verify user can edit block text

**Steps**:
1. Click in first block
2. Type: `This is a paragraph`
3. Wait 2 seconds (autosave triggers)
   - Expected: "Saving..." appears briefly
   - Expected: "Saved" confirmation shows
4. Refresh page
   - Expected: Text persists

**Verification Points**:
-   Block content updated in database
-   Block lastEditedBy updated
-   Block version incremented
-   Revision created on save

---

### Test 3.3: Block Types
**Objective**: Verify different block types work

**Test Paragraph**:
1. Type `/` in block
   - Expected: Command menu shows
2. Click "Paragraph" or type `p`
   - Expected: Block type changes to PARAGRAPH

**Test Heading**:
1. Type `/` in new block
2. Select "Heading"
   - Expected: Block renders as `<h2>` with larger font
   - Expected: Block type = HEADING

**Test Bullet List**:
1. Type `/` in new block
2. Select "Bullet"
   - Expected: Block shows bullet point
   - Expected: Block type = BULLET

**Test Checkbox**:
1. Type `/` in new block
2. Select "Checkbox"
   - Expected: Block shows checkbox
   - Expected: Block type = CHECKBOX
3. Click checkbox
   - Expected: Checkbox toggles on/off
   - Expected: Block content updates

**Test Code Block**:
1. Type `/` in new block
2. Select "Code"
   - Expected: Block shows monospace font
   - Expected: Block type = CODE
3. Type JavaScript code
   - Expected: Code is syntax-highlighted

**Verification Points**:
-   All 5 block types functional
-   Block type stored in database
-   Visual rendering correct for each type

---

### Test 3.4: Add/Delete Blocks
**Objective**: Verify block creation and deletion

**Add Block**:
1. Click at end of last block
2. Press Enter
   - Expected: New empty block created
   - Expected: Focus moves to new block
   - Expected: Order field incremented
3. Type content
   - Expected: Content saves normally

**Delete Block**:
1. Click to select block
2. Press Backspace (when empty) or Ctrl+Shift+X
   - Expected: Block deleted from database
   - Expected: Block removed from UI
   - Expected: Remaining blocks renumbered
3. Verify deletion in Prisma Studio

**Verification Points**:
-   Block order maintained correctly
-   Deleted block removed from database
-   No orphaned blocks remain

---

### Test 3.5: Block Attribution
**Objective**: Verify creator and editor tracking

**Steps**:
1. User A creates note and first block
2. User B joins and edits block
3. Check revision history:
   - createdBy = User A
   - lastEditedBy = User B
   - lastEditedAt = current time

**Verification in Database**:
```bash
cd backend
npx prisma studio
# Open Block table, view one block
# createdBy, lastEditedBy fields show user IDs
```

---

## Module 4: Real-Time Collaboration

### Test 4.1: Multi-User Editing
**Objective**: Verify real-time sync between users

**Setup**:
1. Open app in two browser windows (same workspace, same note)
2. Window A: User 1 (`testuser1`)
3. Window B: User 2 (`testuser2`)

**Test**:
1. User 1 types in first block: "Hello from User 1"
2. Watch Window B
   - Expected: Text appears in real-time (< 100ms)
   - Expected: No refresh needed
3. User 2 types in second block: "Reply from User 2"
4. Watch Window A
   - Expected: Text appears in real-time
5. User 1 types in first block again: " - Updated"
6. Watch Window B
   - Expected: Text updated immediately

**Verification Points**:
-   WebSocket connection established
-   Events broadcast to all users in room
-   DOM updated in real-time
-   No race conditions or data loss

---

### Test 4.2: Presence Indicators
**Objective**: Verify active users shown in PresenceBar

**Steps**:
1. Open app in Window A (User 1)
2. Open note
   - Expected: PresenceBar shows User 1's avatar
3. Open app in Window B (User 2)
4. Open same note
   - Expected: Window A PresenceBar now shows User 1 + User 2
   - Expected: Avatars overlap (visual stacking)
   - Expected: Tooltip shows "User 1 and User 2 editing"
5. Close note in Window B
   - Expected: Window A PresenceBar updates to show only User 1

**Verification Points**:
-   join-note event triggers presence update
-   Presence list broadcast to all users
-   UI updates on user join/leave
-   Session created/deleted in database

---

### Test 4.3: Conflict Detection
**Objective**: Verify conflict handling on simultaneous edits

**Setup**:
1. Window A: User 1 (editing disabled for this test)
2. Window B: User 2 (editing disabled for this test)

**Manual Test**:
1. Both users get block version 1
2. User 1 makes change, increments version to 2
3. User 2 makes change to same block at version 1
4. Expected: Server detects conflict (version mismatch)
5. Expected: Client receives conflict notification
6. Expected: Reload of latest version
7. Expected: "Conflict resolved, showing latest version" message

**Verification Points**:
-   Version numbers checked on block-update
-   Conflict event sent to client
-   Client handles gracefully
-   Latest version wins (last-write-wins strategy)

---

### Test 4.4: Cursor Positions (Typing Indicators)
**Objective**: Verify typing indicator support

**Steps**:
1. Open note in Window A (User 1) and Window B (User 2)
2. User 1 starts typing in a block
   - Expected: Server receives cursor-position event
   - Expected: Window B Redux shows User 1's cursor position
   - (Visual indicator not yet implemented)
3. User 2 types in different block
   - Expected: Window A receives cursor position
4. Stop typing
   - Expected: Cursor position cleared after 5 seconds of inactivity

**Verification Points**:
-   cursor-position event received
-   Redux state updated
-   Cursor data includes: userId, blockId, position, timestamp

---

## Module 5: Comments System

### Test 5.1: Create Comment
**Objective**: Verify users can comment on blocks

**Steps**:
1. User 1 has note open
2. Click on comment icon next to a block
   - Expected: Comment panel opens
3. Enter comment: "Let's review this section"
4. Click Post
   - Expected: Comment appears in panel
   - Expected: User 1's avatar shown
   - Expected: Timestamp shown
5. User 2 (same note open)
   - Expected: Comment appears in real-time (via WebSocket)

**Verification Points**:
-   Comment created in database
-   BlockId and UserId stored
-   Timestamp recorded
-   CREATE_COMMENT activity logged

---

### Test 5.2: Resolve Comments
**Objective**: Verify comments can be marked resolved

**Steps**:
1. Comment exists on block
2. Click "Resolve" button on comment
   - Expected: Comment marked as resolved
   - Expected: Visual change (strikethrough/dimmed)
3. Click "Unresolve"
   - Expected: Comment unmarked

**Verification Points**:
-   resolved flag updated in database
-   RESOLVE_COMMENT activity logged
-   Real-time update to other users

---

### Test 5.3: Delete Comment
**Objective**: Verify comment deletion

**Steps**:
1. Comment exists on block
2. Click "Delete" button (if author or OWNER)
   - Expected: Comment removed
   - Expected: COMMENT_DELETED activity logged
3. Non-authors cannot delete
   - Expected: Delete button disabled/hidden

---

## Module 6: Version Control & Revisions

### Test 6.1: Revision Creation
**Objective**: Verify revisions created on save

**Steps**:
1. Create note with text: "Version 1"
2. Wait for autosave
3. Edit to: "Version 1 - Updated"
4. Wait for autosave
5. Open Revision panel (right sidebar)
   - Expected: 2 revisions shown
   - Expected: Timestamps differ
   - Expected: Both show user who made change

**Verification Points**:
-   Revision created on each save
-   Blocks JSON snapshot stored
-   Version number incremented
-   Revisions ordered by date (newest first)

---

### Test 6.2: View Revision
**Objective**: Verify users can view old versions

**Steps**:
1. Have multiple revisions of note
2. Click on older revision in Revision panel
   - Expected: Note content shows old version
   - Expected: Blocks match revision snapshot
   - Expected: "Viewing revision #X of Y" message shown

---

### Test 6.3: Restore Revision
**Objective**: Verify users can restore previous version

**Steps**:
1. Have 3 revisions
2. Current note: "Version 3"
3. Click "Restore" on revision #1 (showing "Version 1")
   - Expected: Confirmation dialog
4. Click Confirm
   - Expected: Note reverts to version 1 content
   - Expected: New revision created with full rollback note
   - Expected: RESTORE_VERSION activity logged
   - Expected: All users see new version in real-time

---

## Module 7: Note Sharing

### Test 7.1: Create Share Link
**Objective**: Verify shareable links can be generated

**Steps**:
1. Open note
2. Click share icon
   - Expected: Modal opens with share options
3. Click "Create Share Link"
   - Expected: Random token generated
   - Expected: Link shown: `http://localhost:5173/share/{token}`
   - Expected: Copy button copies link to clipboard
4. CREATE_SHARE_LINK activity logged

---

### Test 7.2: Access Shared Note
**Objective**: Verify public access via share link

**Steps**:
1. Open new incognito window (no login)
2. Visit share link from Test 7.1
   - Expected: Note content shows
   - Expected: No authentication required
   - Expected: Editing disabled (view-only)
3. Try to edit
   - Expected: Cannot make changes
   - Expected: "View-only" indicator shown

---

### Test 7.3: Revoke Share Link
**Objective**: Verify share links can be disabled

**Steps**:
1. Note has share link
2. Click share icon
3. Click "Revoke Share Link"
   - Expected: Token cleared from database
   - Expected: Link no longer works
4. Try old share link
   - Expected: 404 or "Note not found" message

---

## Module 8: Activity Log

### Test 8.1: Activity Creation
**Objective**: Verify activities logged for all actions

**Steps**:
1. Perform various actions in workspace:
   - Create note
   - Edit block
   - Add comment
   - Restore revision
   - Add member
2. Open Activity log
   - Expected: All actions appear
   - Expected: User names shown
   - Expected: Timestamps correct
   - Expected: Action types correct

**Activity Types to Verify**:
-   CREATE_NOTE
-   EDIT_BLOCK
-   ADD_BLOCK
-   DELETE_BLOCK
-   CREATE_COMMENT
-   RESOLVE_COMMENT
-   RESTORE_VERSION
-   CREATE_SHARE_LINK
-   ADD_WORKSPACE_MEMBER
-   REMOVE_WORKSPACE_MEMBER

---

### Test 8.2: Activity Filtering
**Objective**: Verify activity log filtering

**Steps**:
1. Open Activity log
2. Filter by action type: "Edit Block"
   - Expected: Only EDIT_BLOCK activities shown
3. Filter by user: "testuser1"
   - Expected: Only testuser1's actions shown
4. Filter by date range
   - Expected: Only activities in range shown
5. Clear filters
   - Expected: All activities shown

---

## Module 9: Error Handling

### Test 9.1: Network Errors
**Objective**: Verify graceful error handling

**Steps**:
1. Open DevTools → Network → Throttle to Offline
2. Try to edit note
   - Expected: "Connection lost" message
   - Expected: Changes queued
3. Restore connection
   - Expected: Queued changes sync
   - Expected: Success message

---

### Test 9.2: Validation Errors
**Objective**: Verify form validation

**Steps**:
1. Register with invalid email
   - Expected: "Invalid email format" error
2. Create workspace with empty name
   - Expected: "Name is required" error
3. Add member with non-existent username
   - Expected: "User not found" error

---

### Test 9.3: Authorization Errors
**Objective**: Verify permission enforcement

**Steps**:
1. VIEWER tries to edit note
   - Expected: Edit disabled
   - Expected: Proper error message
2. Non-owner tries to delete note
   - Expected: Permission denied error
3. Non-owner tries to add member
   - Expected: Only-owner error message

---

## Module 10: Performance Tests

### Test 10.1: Large Note Performance
**Objective**: Verify app handles large documents

**Steps**:
1. Create note with 100+ blocks
2. Load time < 2 seconds
   - Expected: Measured in DevTools Performance tab
3. Scroll smoothly
   - Expected: No jank or lag
4. Edit blocks
   - Expected: No perceivable delay
5. Save time < 500ms
   - Expected: Measured from edit to save confirm

---

### Test 10.2: Real-Time Sync Under Load
**Objective**: Verify WebSocket handles concurrent edits

**Steps**:
1. 5+ users in same note
2. Each types in different blocks simultaneously
3. Watch for:
   -   All changes sync correctly
   -   No data loss
   -   No duplicate changes
   -   Latency < 200ms

---

### Test 10.3: Search Performance
**Objective**: Verify search indexing

**Steps**:
1. Create 100+ notes with varied content
2. Search for term: "performance"
   - Expected: Results in < 500ms
   - Expected: All matching notes shown
   - Expected: Correct blocks highlighted

---

## Acceptance Criteria Checklist

###   All Tests Passing
- [ ] Module 1: Authentication (5 tests)
- [ ] Module 2: Workspaces (5 tests)
- [ ] Module 3: Notes & Blocks (5 tests)
- [ ] Module 4: Real-Time (4 tests)
- [ ] Module 5: Comments (3 tests)
- [ ] Module 6: Revisions (3 tests)
- [ ] Module 7: Sharing (3 tests)
- [ ] Module 8: Activity (2 tests)
- [ ] Module 9: Errors (3 tests)
- [ ] Module 10: Performance (3 tests)

###   Code Quality
- [ ] TypeScript compilation clean (no errors)
- [ ] No ESLint warnings
- [ ] All endpoints tested with curl
- [ ] Database migrations clean
- [ ] No console errors in DevTools

###   Security
- [ ] JWT tokens validated
- [ ] Passwords hashed with bcrypt
- [ ] CORS configured correctly
- [ ] SQL injection tests passed
- [ ] XSS prevention verified

###   User Experience
- [ ] Responsive design (desktop/tablet/mobile)
- [ ] Dark mode styling (if supported)
- [ ] Error messages clear and helpful
- [ ] Loading states shown
- [ ] Keyboard navigation works

###   Documentation
- [ ] All features documented
- [ ] API endpoints documented
- [ ] Database schema documented
- [ ] WebSocket events documented
- [ ] Troubleshooting guide complete

---

## Test Report Template

When running tests, use this format:

```
TEST SUITE: [Module Name]
Date: [Date]
Tester: [Name]
Browser: [Chrome/Firefox/Safari]

Test 1: [Test Name]
  Status: [PASS/FAIL]
  Duration: [time]
  Notes: [Any observations]

Test 2: [Test Name]
  Status: [PASS/FAIL]
  Duration: [time]
  Notes: [Any observations]

OVERALL: [X/Y tests passed]
BLOCKERS: [Any failures preventing deployment]
```

---

## Continuous Testing

After each code change:

1. **Unit Tests** - Test individual functions
2. **Integration Tests** - Test module interactions
3. **E2E Tests** - Test full workflows
4. **Performance Tests** - Verify speed
5. **Security Tests** - Verify protections

Run tests:
```bash
# Backend
cd backend
npm run test

# Frontend
cd frontend
npm run test
```

---

This comprehensive guide ensures all features work correctly before production deployment. Happy testing!  

