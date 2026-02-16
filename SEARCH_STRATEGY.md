# Search & Indexing Strategy

## Overview

The collaborative notes application implements a **hybrid search approach** with an in-memory index for fast frontend search and a fallback backend search API.

## Frontend Search Index

### Data Structure

```typescript
// searchIndex.ts
class SearchIndex {
  private index: Map<string, string> = new Map();
  
  // noteId → "searchable text (title + content)"
  // Example:
  // {
  //   "note-123": "My Meeting Notes TODO implement search...",
  //   "note-456": "Travel Plans Paris hotel booking..."
  // }
}
```

### Operations

#### 1. Add Note to Index

```typescript
addNote(noteId: string, content: string) {
  // Normalize for searching
  const normalized = content.toLowerCase();
  this.index.set(noteId, normalized);
  
  // Complexity: O(m) where m = string length
  // Typically: O(1) in Big-O amortized sense
}
```

**When:** 
- On note creation
- On note update
- On bulk load (initialize)
- On revision restore

#### 2. Search Index

```typescript
search(query: string): string[] {
  const normalized = query.toLowerCase();
  const results: string[] = [];
  
  // Linear scan through index
  for (const [noteId, content] of this.index) {
    if (content.includes(normalized)) {
      results.push(noteId);
    }
  }
  
  return results;
  
  // Complexity: O(n * m) where:
  // n = number of notes
  // m = average content length
}
```

**Characteristics:**
- Simple contains() matching
- Case-insensitive
- Searches both title and blocks
- No ranking (returns all matches)
- Real-time results

#### 3. Remove Note from Index

```typescript
removeNote(noteId: string) {
  this.index.delete(noteId);
  
  // Complexity: O(1)
}
```

**When:**
- On note deletion
- On index rebuild

### Index Update Flow

```
User types in SearchBar
         │
         ▼
dispatch(setSearchQuery(text))
         │
         ▼
Redux state updates
         │
         ▼
NotesList component re-renders
         │
         ▼
selector calls searchIndex.search(query)
         │
         ▼
Returns filtered noteIds immediately
         │
         ▼
Component renders filtered notes
```

**Latency:** < 1ms for typical notes count (< 1000 notes)

## Redux Integration

### State Management

```typescript
// notesSlice.ts
interface NotesState {
  notes: Record<string, Note>;      // All notes
  searchQuery: string;               // Current search
  // ... other state
}

// Selector to get filtered notes
export const selectFilteredNotes = (state: RootState) => {
  const { notes, searchQuery } = state.notes;
  const noteArray = Object.values(notes);
  
  if (!searchQuery.trim()) {
    return noteArray;
  }
  
  const matchedIds = searchIndex.search(searchQuery);
  return noteArray.filter(n => matchedIds.includes(n.id));
};
```

### Update On State Changes

```typescript
// notesSlice.ts

hydrateNoteFromServer(state, action) {
  const note = action.payload;
  
  state.notes[note.id] = note;
  
  // Update index immediately
  searchIndex.removeNote(note.id);
  searchIndex.addNote(
    note.id,
    note.title + " " + flattenBlocks(note.blocks)
  );
}

deleteNote(state, action) {
  const id = action.payload;
  
  searchIndex.removeNote(id);  // Remove from index
  delete state.notes[id];
}

renameNote(state, action) {
  const { id, title } = action.payload;
  const note = state.notes[id];
  
  note.title = title;
  
  // Update index with new title
  searchIndex.removeNote(id);
  searchIndex.addNote(
    id,
    title + " " + flattenBlocks(note.blocks)
  );
}

updateBlock(state, action) {
  const block = state.localBlocks.find(...);
  block.content = action.payload.content;
  
  // NOTE: Index updates on save, not during typing
  // This prevents excessive index updates
}
```

## Backend Search (Fallback)

### Implementation

```typescript
// notes.service.ts
async search(query: string) {
  const normalizedQuery = query.toLowerCase();
  
  // Fetch all notes (could optimize with DB-level search)
  const notes = await this.prisma.note.findMany({
    orderBy: { updatedAt: 'desc' },
  });
  
  // Filter matches
  return notes
    .map(note => ({
      ...note,
      blocks: JSON.parse(note.blocks),
    }))
    .filter(note => {
      const titleMatch = 
        note.title.toLowerCase().includes(normalizedQuery);
      
      const blocksMatch = 
        note.blocks.some(block =>
          block.content.toLowerCase().includes(normalizedQuery)
        );
      
      return titleMatch || blocksMatch;
    });
}
```

### Endpoint

```
GET /notes/search?q=query

Returns: Note[]

Example:
GET /notes/search?q=meeting
[
  { id: "...", title: "Team Meeting", blocks: [...] },
  { id: "...", title: "1:1 with Manager", blocks: [...] }
]
```

## Complexity Analysis

### Space Complexity

**Frontend Index:**
```
O(m) where m = total characters in all notes

Example:
100 notes × average 5000 chars each = 500KB index
1000 notes × average 5000 chars each = 5MB index
```

### Time Complexity

| Operation | Frontend | Backend |
|-----------|----------|---------|
| Add note | O(1) | N/A |
| Remove note | O(1) | N/A |
| Search | O(n×m) | O(n×m) |
| Update index | O(1) | N/A |

**Where:**
- n = number of notes
- m = average note length

### Real-World Performance

**Typical Setup (100 notes, 5KB avg):**
- Index size: ~500KB
- Search latency: < 1ms
- Index update: < 0.1ms

**Large Setup (10,000 notes, 5KB avg):**
- Index size: ~50MB
- Search latency: 50-100ms
- Index update: < 0.1ms

## Search Features

### What's Searchable

1. **Note Title**: Full word search
2. **Block Content**: Full text search
3. **Block Type**: Not indexed (not needed)

### What's NOT Searchable

- Version history
- Metadata (timestamps, updatedBy)
- Deleted notes (good - privacy)

### Search Behavior

- **Case-insensitive**: "NOTES" matches "notes"
- **Substring match**: "meet" matches "meeting"
- **All fields**: Searches title + all blocks
- **Real-time**: Updates as you type
- **Instant**: Completes in milliseconds

## Update Strategy

### When Index is Updated

| Event | Frontend | Backend |
|-------|----------|---------|
| Create note |   (on successful response) |   (after save) |
| Update note |   (on save success) |   (after update) |
| Delete note |   (on success) |   (after delete) |
| Restore revision |   (on success) |   (after restore) |
| Search query | N/A |   (on GET request) |

### Index Consistency

**Frontend Index ≈ Backend Data**

Scenarios where they might diverge:
1. Network lag (eventual consistency)
2. Multiple tabs open (not synced)
3. Offline editing (not applicable)

**Reconciliation:** When user opens app or refreshes, `initializeNotesThunk` rebuilds index from API.

## Optimization Opportunities

### Current Implementation
- Simple substring matching
- Linear search through all notes
- No ranking or relevance scoring

### Potential Improvements

#### 1. Prefix Search
```typescript
// Only match words that START with query
search(query: string): string[] {
  const results = [];
  for (const [noteId, content] of this.index) {
    const words = content.split(/\s+/);
    if (words.some(w => w.startsWith(query))) {
      results.push(noteId);
    }
  }
  return results;
}
```

#### 2. Relevance Ranking
```typescript
// Return best matches first
search(query: string): string[] {
  const results = this.index.entries()
    .filter(([id, content]) => content.includes(query))
    .map(([id, content]) => ({
      id,
      score: this.calculateScore(content, query)
    }))
    .sort((a, b) => b.score - a.score)
    .map(r => r.id);
  
  return results;
}

calculateScore(content: string, query: string) {
  // Title matches > content matches
  // Early matches > late matches
  // Frequency > position
}
```

#### 3. Database Full-Text Search
```sql
-- SQLite FTS5
CREATE VIRTUAL TABLE notes_fts USING fts5(
  title,
  content,
  content=notes
);

-- Search: faster on large datasets
SELECT * FROM notes_fts 
WHERE notes_fts MATCH 'meeting'
```

#### 4. Trie Data Structure
```typescript
// For prefix matching
class TrieNode {
  children: Map<string, TrieNode>;
  noteIds: Set<string>;
}

// O(k) search where k = query length
// Good for autocomplete
```

#### 5. Inverted Index
```typescript
// word → [noteId1, noteId2, ...]
{
  "meeting": ["note-1", "note-5"],
  "team": ["note-1", "note-2"],
  "urgent": ["note-5"]
}

// O(1) lookup but O(n) merge for multi-word queries
```

## Testing Search

### Manual Tests

```
1. Create 3 notes:
   - "Team Meeting Notes"
   - "Travel Plans"
   - "Project Proposal"

2. Search for "meet"
   → Should return "Team Meeting Notes"

3. Search for "plan"
   → Should return "Travel Plans"

4. Search for "notes"
   → Should return "Team Meeting Notes"

5. Edit "Team Meeting Notes" title to "Standup Notes"
   → Search for "team" should return no results
   → Search for "standup" should return updated note

6. Delete "Project Proposal"
   → Search should not return it

7. Search with no results
   → Should show "No notes found"
```

### Edge Cases

```
// Empty query
searchIndex.search("")
→ [] (special handling: return all via fallback)

// Special characters
searchIndex.search("C++ programming")
→ Should handle punctuation gracefully

// Unicode
searchIndex.search("café")
→ Should work with accents

// Very long query
searchIndex.search("a".repeat(10000))
→ Should handle without hanging

// Very large number of results
100 notes all contain "the"
→ Should return all efficiently
```

## Implementation Files

### Frontend
- [src/features/notes/searchIndex.ts](../frontend/src/features/notes/searchIndex.ts) - In-memory index
- [src/features/notes/notesSlice.ts](../frontend/src/features/notes/notesSlice.ts) - Redux integration
- [src/components/search/SearchBar.tsx](../frontend/src/components/search/SearchBar.tsx) - UI component

### Backend
- [src/modules/notes/notes.service.ts](../backend/src/modules/notes/notes.service.ts) - Search service

### API
- `GET /notes/search?q=query` - Backend search endpoint

## Decision Rationale

### Why In-Memory Index?

  **Pros:**
- Sub-millisecond search
- No database queries needed
- Simple to implement
- Works offline
- Fast UI updates

  **Cons:**
- Limited to note count that fits in memory
- Requires rebuild on app load
- No persistence

### Why Fallback to Backend?

  **Pros:**
- Authoritative source
- Works for large datasets
- Can optimize with database indexes
- Good for sharing search results

  **Cons:**
- Network latency
- Not real-time
- Server load

### Recommendation

For notes app with < 10,000 notes: **Frontend index is perfect**

For notes app with > 100,000 notes: **Use database full-text search**

---

**Fast search = better user experience! **
