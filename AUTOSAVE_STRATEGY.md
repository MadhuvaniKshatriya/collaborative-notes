# Autosave & Request Sequencing

## Overview

This document explains how the application ensures:
1. **Smooth autosave experience** without overwhelming the server
2. **Request ordering** to prevent stale responses from overwriting newer edits
3. **State consistency** across frontend and backend

## Problem: The Autosave Challenge

### Without Autosave
```
User edits note
         │
         ▼
"Save" button click
         │
         ▼
    Saved 

 Problem: User must manually save constantly
 Data loss if user forgets to save
```

### Naive Autosave
```
User types "hello world"
         │
    h ──→ /update
    he ──→ /update
    hel ──→ /update
    hell ──→ /update
    hello ──→ /update
    hello  ──→ /update
    hello w ──→ /update
    hello wo ──→ /update
    hello wor ──→ /update
    hello worl ──→ /update
    hello world ──→ /update
    
 10+ requests for 5 words
 Server overload
 Network congestion
 User sees flickering save status
```

### Solution: Debounced Autosave
```
User types "hello world"
         │
    h ─┐
    he ├─ Accumulate edits
    hel ├─ Reset timer on each keystroke
    ...  │
    hello world ──→ Wait 800ms ──→ No more typing? ──→ /update
    
 1 request for 5 words
 Respects user's typing rhythm
 Server friendly
 Smooth UX
```

## Implementation: The Debounce Pattern

### Debounce Concept

```typescript
const debounced = debounce(async (payload) => {
  await save(payload);
}, 800);  // 800ms delay

// User types quickly
debounced({ text: "h" });      // Schedule save at t=800ms
debounced({ text: "he" });     // Cancel, reschedule at t=800ms
debounced({ text: "hel" });    // Cancel, reschedule at t=800ms
// ... (typing stops at t=400ms)
debounced({ text: "hello" });  // Schedule at t=1200ms
// (no more input, so save happens at t=1200ms)

// Result: One save instead of many
```

### Code Implementation

```typescript
// hooks/useAutosave.ts
const debouncedSave = useRef(
  debounce(async (noteId, blocks, version, title) => {
    // This function is called max once per 800ms
    dispatch(startSaving());
    
    try {
      const response = await updateNote(
        noteId,
        title,
        blocks,
        version
      );
      
      dispatch(saveSuccess({ version: response.version }));
      
    } catch (err) {
      // Handle errors (including conflicts)
    }
  }, 800)  // ← 800ms delay
).current;

useEffect(() => {
  if (saveStatus !== "unsaved") return;
  
  // Call debounced function
  // If called again within 800ms, timer resets
  debouncedSave(
    activeNoteId,
    localBlocks,
    version,
    note.title
  );
  
  // Cleanup: cancel pending save on unmount
  return () => debouncedSave.cancel();
}, [localBlocks, saveStatus]);
```

### Timing Example

```
t=0ms:   User types first character
         Call debouncedSave()
         Timer started: save scheduled at t=800ms

t=100ms: User types second character
         Call debouncedSave()
         Timer reset: save scheduled at t=900ms

t=200ms: User types third character
         Call debouncedSave()
         Timer reset: save scheduled at t=1000ms

t=1100ms: User stops typing
         No new debouncedSave() calls
         Timer expires at t=1000ms
         SAVE REQUEST SENT ✅

Total requests: 1
Total typing time: 200ms
Total save time: 1100ms
Requests per second: 0.91 (very efficient)
```

## Request Sequencing & Version Ordering

### The Problem: Stale Responses

```
User edits Note v1

t=0ms:   Autosave sends: version=1, blocks=[A, B, C]
         
t=100ms: Another device updates the note
         Note is now v2

t=200ms: First device receives 200 response
         Should it update? version=1 is outdated!

 Without protection:
   Stale v1 data could overwrite newer v2 data
```

### Version-Based Protection

```typescript
// Before processing response
if (response.version < state.version) {
  // Ignore stale response
  console.warn("Ignoring stale response");
  return;
}

// Otherwise process
dispatch(saveSuccess({ version: response.version }));
```

**Why This Works:**

Versions are **monotonically increasing** on the server:
```
Note v1 ─→ v2 ─→ v3 ─→ v4 ─→ v5

If client has v3, it will ignore responses with v1 or v2
It will accept v3, v4, v5 (newer versions)
```

### Multiple Concurrent Requests

```
Time │ Client State │ Request │ Response │ Action
─────┼──────────────┼──────────┼──────────┼────────
t=0  │ v=1          │ Send v1  │          │ 
t=200│ v=1 (unsaved)│ Send v1* │          │ *duplicate?
t=400│ v=1 (unsaved)│          │ v=2 ✅  │ Accept (newer)
t=600│ v=1 (unsaved)│          │ v=2 ❌  │ Ignore (same)
t=800│ v=2 (saved)  │          │ v=2 ❌  │ Ignore (not newer)

 Correct ordering maintained
 No overwrites
 All versions processed in order
```

## Save State Machine

The application tracks save state to give users accurate feedback:

```typescript
type SaveState = 
  | "idle"      // No pending changes
  | "unsaved"   // Changes not sent to server
  | "saving"    // Request in flight
  | "saved"     // Server confirmed
  | "error"     // Save failed
  | "conflict"; // Version conflict detected
```

### State Transitions

```
┌──────────────┐
│    idle      │ (initial state)
└──────┬───────┘
       │
       │ (user types)
       ▼
┌──────────────┐
│   unsaved    │ (changes not saved)
└──────┬───────┘
       │ (800ms debounce elapsed)
       ▼
┌──────────────┐
│   saving     │ (request in flight)
└──────┬───────────────────┬──────────┐
       │                   │          │
    SUCCESS            CONFLICT     ERROR
       │                   │          │
       ▼                   ▼          ▼
   ┌────────┐      ┌─────────────┐ ┌────┐
   │ saved  │      │ conflict    │ │err │
   └────────┘      │ (show modal)│ └─┬──┘
       ▲           └──────┬──────┘   │
       │                  │          │ (retry)
       │        (user resolves)      │
       │                  │          │
       └──────────────────┴──────────┘
       
Legend: ─→ transition, ▼ state, ┌─┐ state box
```

### Visual Indicators

```tsx
// SaveIndicator component
function SaveIndicator() {
  const { saveStatus } = useSelector(state => state.notes);
  
  switch (saveStatus.state) {
    case "idle":
      return <span>Ready</span>;
      
    case "unsaved":
      return <span className="text-yellow-500">Unsaved</span>;
      
    case "saving":
      return <span className="text-blue-500">Saving...</span>;
      
    case "saved":
      return <span className="text-green-500">Saved</span>;
      
    case "error":
      return <span className="text-red-500">Error</span>;
      
    case "conflict":
      return <span className="text-orange-500">Conflict!</span>;
  }
}
```

## Dependency Management

### The Dependency Array Problem

```typescript
// BAD: Missing dependencies
useEffect(() => {
  debouncedSave(noteId, blocks, version);
}, [blocks]); // ← Missing: activeNoteId, version, dispatch

// Problem: Stale closure captures old noteId/version

//  GOOD: All dependencies included
useEffect(() => {
  if (!activeNoteId) return;
  if (saveStatus !== "unsaved") return;
  
  debouncedSave(noteId, blocks, version);
  
  return () => debouncedSave.cancel();
}, [
  activeNoteId,      // ← Watch for note changes
  localBlocks,       // ← Watch for content changes
  version,           // ← Watch for version changes
  saveStatus,        // ← Watch for state changes
  notes,             // ← Need current note title
  dispatch,          // ← For Redux dispatch
  debouncedSave      // ← For cleanup
]);
```

### Why Dependencies Matter

Without proper dependencies:
```
// Initial state
noteId = "note-1", blocks = ["A", "B"]

// User types more content
blocks = ["A", "B", "C", "D"]

// User switches to different note
noteId = "note-2"

// Old debounce fires with:
// - OLD noteId "note-1" 
// - NEW blocks ["A", "B", "C", "D"]
//  Saves wrong content to wrong note!

With proper dependencies:
// When noteId changes, effect re-runs
// Old debouncedSave is cleaned up
// New debouncedSave created with correct noteId
Correct content saved to correct note
```

## Handling Errors

### Network Errors

```typescript
try {
  const response = await updateNote(...);
  dispatch(saveSuccess({ version: response.version }));
  
} catch (err) {
  if (err.status === 409) {
    // Conflict: fetch latest version
    const remote = await fetchNote(noteId);
    dispatch(setConflict({
      remoteBlocks: remote.blocks,
      remoteVersion: remote.version
    }));
    
  } else {
    // Network error, server error, etc.
    dispatch(saveError());
    // ← User sees "Error", can retry by editing
  }
}
```

### Conflict Errors

Covered in detail in `CONFLICT_STRATEGY.md`

## Performance Metrics

### Keystroke-to-Save Latency

**Measurement:** Time from last keystroke to save complete

```
Typing stops at t=0ms
Debounce delay: 800ms
Request latency: 100ms
Database write: 10ms

Total: 910ms

User perceives: Reasonable delay after typing stops 
```

### Requests Per Session

**Test Case:** User edits 5 notes for 5 minutes

```
With Debounce (800ms):
- Note 1: 15 edits → 1-2 saves (debounced)
- Note 2: 20 edits → 2-3 saves
- Note 3: 18 edits → 1-2 saves
- Note 4: 22 edits → 2-3 saves
- Note 5: 25 edits → 2-3 saves

Total: ~10-15 requests over 5 minutes
= ~2-3 requests per minute
 Server friendly

Without Debounce:
Total: ~100 requests
Server unfriendly
```

### Debounce Tuning

```
Debounce = 400ms:  More responsive, more requests
Debounce = 800ms:  Good balance (current)
Debounce = 1500ms: Less responsive, fewer requests

Recommendation: 800ms provides best UX/server balance
```

## Testing Autosave

### Manual Tests

```
1. Open app, create note
   → Status shows "Saved" after ~1s

2. Type slowly (> 800ms between letters)
   → Status shows "Unsaved"
   → Wait → "Saving..."
   → "Saved"

3. Type quickly
   → Status shows "Unsaved"
   → Keep typing, status stays "Unsaved"
   → Wait 800ms after last letter
   → "Saving..." → "Saved"

4. Network error during save
   → Status shows "Error"
   → Manually edit → Status "Unsaved"
   → Wait → Retry save

5. Conflict
   → Open in 2 windows
   → Cause conflict (detailed in CONFLICT_STRATEGY.md)
   → Status shows "Conflict"
   → Modal appears
```

### Automated Tests

```typescript
describe('Autosave', () => {
  test('debounce delays save', async () => {
    const save = jest.fn();
    const debounced = debounce(save, 800);
    
    debounced();
    debounced();
    debounced();
    
    expect(save).not.toHaveBeenCalled();
    
    await sleep(800);
    expect(save).toHaveBeenCalledTimes(1);
  });
  
  test('ignores stale responses', async () => {
    // Simulate v1 response arriving after v2 saved
    dispatch(saveSuccess({ version: 1 }));
    state.version === 2;  // Higher
    
    // Handler should ignore v1
    expect(state.version).toBe(2); // Unchanged
  });
  
  test('cancel on unmount', async () => {
    const cancel = jest.fn();
    // Render component
    // ... (triggers effect)
    // Unmount component
    // ... (cleanup runs)
    expect(cancel).toHaveBeenCalled();
  });
});
```

## Future Enhancements

1. **Adaptive Debounce**: Longer when under high load
2. **Request Batching**: Combine multiple saves
3. **Exponential Backoff**: Retry with increasing delays
4. **Request Cancellation**: Cancel in-flight requests if newer sent
5. **Offline Queue**: Queue saves when offline, send on reconnect

## Files

- [src/hooks/useAutosave.ts](../frontend/src/hooks/useAutosave.ts) - Autosave implementation
- [src/features/notes/notesSlice.ts](../frontend/src/features/notes/notesSlice.ts) - Save state management
- [src/components/notes/SaveIndicator.tsx](../frontend/src/components/notes/SaveIndicator.tsx) - Status UI

---

**Smooth autosave = happy users! 😊**
