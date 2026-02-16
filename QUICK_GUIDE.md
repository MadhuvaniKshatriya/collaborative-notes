# Quick Reference: Using the Improved Notes App

## Block Types & Shortcuts

### Create Different Block Types Using Slash Commands

Type `/` and select from the menu:

| Block Type | Shortcut | Purpose | Behavior |
|---|---|---|---|
| **Paragraph** | `/paragraph` | Regular text | Multi-line text, press Enter for newline |
| **Heading** | `/heading` | Section titles | Large bold text (4xl) |
| **Checkbox** | `/checkbox` | To-do items | ✓ Check off items (gray + strikethrough when checked) |
| **Bullet** | `/bullet` | Lists | • Bullet points (Amber colored) |
| **Code** | `/code` | Code snippets | Dark theme with mono font |

---

## Keyboard Shortcuts

| Action | Keys |
|---|---|
| Create new block below | `Enter` (paragraph) or `Shift+Enter` (other types) |
| Insert new paragraph | `Shift+Enter` (in any block) |
| Delete empty checkbox | `Backspace` (on empty checkbox) |
| Close slash menu | `Escape` |
| New checkbox in list | `Enter` (inside checkbox) |

---

## Visual States Explained

### Save Status Indicators

| Icon | State | Meaning |
|---|---|---|
| 💾 (pulsing) | Saving... | Data being sent to server |
| ✓ | Saved | Changes successfully saved |
| ✕ | Error | Save failed (check connection) |
| ⚠ | Conflict | Changes conflict with server version |
| ● | Unsaved | Changes not yet sent |

### Note States

| State | Visual | Meaning |
|---|---|---|
| **Active** | Blue background | Currently editing |
| **Inactive** | White with hover | Available to edit |
| **Searching** | Filtered list | Results for search query |

### Checkbox States

| State | Visual | Meaning |
|---|---|---|
| **Unchecked** | ☐ • Normal text | Task not done |
| **Checked** | ☑ • Gray strikethrough | Task completed |

---

## Workflow: Creating & Managing Notes

### Creating a Note
1. Click **➕ New Note** button in sidebar
2. A new blank note appears at top of list
3. Click the title to rename it
4. Start typing with `/` for different block types

### Editing a Note
1. Click a note in the list to open it
2. Type or use `/` commands
3. Auto-saves after 800ms of inactivity
4. Watch the save indicator in top right

### To-Do Workflow
1. Type `/checkbox` and select "Checkbox"
2. Type your task
3. Press `Enter` to add another checkbox
4. Click the checkbox to mark as done ✓
5. Completed items turn gray

### Searching Notes
1. Type in the **🔍 Search notes...** box in sidebar
2. Results update instantly
3. Click ✕ to clear search

### Managing Revisions
1. Open a note
2. Check **⏰ Revision History** in right panel
3. Click **↺** to restore a previous version
4. Revisions show version number, date/time, and preview
5. New revision created automatically

---

## Common Tasks

### Rename a Note
1. Hover over note in sidebar
2. Click **✏️** button
3. Edit the name
4. Press `Enter` or click away to save

### Delete a Note
1. Hover over note in sidebar
2. Click **🗑️** button
3. Note is permanently deleted

### Handle Conflicts
When you see **⚠ Conflict** status:
1. A modal appears showing local vs remote changes
2. Choose to keep your changes or accept server version
3. Autosave retries automatically

### View Multiple Block Types
```
# Try this in a new note:

This is a paragraph with normal text
/heading → A Nice Section Title
/bullet → First item
/bullet → Second item
/checkbox → Buy milk
/checkbox → Call mom
/code → function hello() { }
```

---

## Design Elements

### Colors Used

| Color | Use | Hex |
|---|---|---|
| Blue | Primary actions, active states | #3b82f6 |
| Amber | Bullet points, accents | #FBBF24 |
| Green | Success states | #10B981 |
| Red | Delete, errors | #EF4444 |
| Slate | Text, backgrounds | #64748B |

### Spacing

- **Gap between blocks**: 2px
- **Padding in blocks**: 8px - 24px
- **Sidebar width**: 340px
- **Editor max width**: 48rem

### Animations

- **Hover effects**: 200ms ease
- **Focus rings**: Blue with 0.1 opacity
- **Save pulse**: Infinite animation
- **Transitions**: Smooth 200ms

---

## Troubleshooting

### "Unsaved" Status Won't Clear
- Check internet connection
- Make sure backend is running on port 5000
- Check browser console for errors

### Checkbox Text Moving
- Fixed! Now text stays in place when converting to checkbox
- Blank checkbox appears on new line

### Search Not Working
- Wait a moment for index to build
- Try searching with fewer letters
- Check spelling

### Revision History Empty
- Only appears after saving a note
- Revisions created automatically with each save
- Empty notes won't have revisions

### Port Already in Use
- Frontend: Uses 5174 if 5173 busy
- Backend: Use different port if 5000 busy
- Kill processes: `taskkill /PID <pid> /F`

---

## Tips & Tricks

💡 **Pro Tips:**

1. **Quick Block Type Change**
   - Type `/paragraph` while editing another block
   - Keeps most text, changes block type

2. **Empty Note Cleanup**
   - Delete unused empty checkboxes by pressing `Backspace`

3. **Search Tips**
   - Partial words work: "gro" finds "groceries"
   - Case insensitive search
   - Searches titles and all block content

4. **Version History**
   - Every 800ms of inactivity = new autosave
   - 100+ versions possible
   - Restore any previous version

5. **Conflict Prevention**
   - Close duplicate tabs
   - Wait for "Saved" indicator before closing
   - Don't edit same note in 2 windows simultaneously

---

## Keyboard-Only Navigation

| Key | Action |
|---|---|
| `Tab` | Move to next element |
| `Shift+Tab` | Move to previous element |
| `Enter` | Select/activate button or input |
| `Escape` | Close menus/dialogs |
| `Ctrl+A` | Select all text |

---

**Questions? Check the main README.md or the strategy guides!**
