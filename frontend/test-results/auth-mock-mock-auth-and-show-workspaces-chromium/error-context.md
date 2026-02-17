# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]: "[plugin:vite:import-analysis] Failed to resolve import \"../../components/layout/EditorLayout\" from \"src/pages/NotesEditorPage.tsx\". Does the file exist?"
  - generic [ref=e5]: C:/Users/madhu/collaborative-notes/frontend/src/pages/NotesEditorPage.tsx:3:25
  - generic [ref=e6]: "3 | import React, { useEffect } from \"react\"; 4 | import { useParams } from \"react-router-dom\"; 5 | import EditorLayout from \"../../components/layout/EditorLayout\"; | ^ 6 | export default function NotesEditorPage() { 7 | _s();"
  - generic [ref=e7]: at TransformPluginContext._formatLog (file:///C:/Users/madhu/collaborative-notes/frontend/node_modules/vite/dist/node/chunks/config.js:28999:43) at TransformPluginContext.error (file:///C:/Users/madhu/collaborative-notes/frontend/node_modules/vite/dist/node/chunks/config.js:28996:14) at normalizeUrl (file:///C:/Users/madhu/collaborative-notes/frontend/node_modules/vite/dist/node/chunks/config.js:27119:18) at process.processTicksAndRejections (node:internal/process/task_queues:95:5) at async file:///C:/Users/madhu/collaborative-notes/frontend/node_modules/vite/dist/node/chunks/config.js:27177:32 at async Promise.all (index 3) at async TransformPluginContext.transform (file:///C:/Users/madhu/collaborative-notes/frontend/node_modules/vite/dist/node/chunks/config.js:27145:4) at async EnvironmentPluginContainer.transform (file:///C:/Users/madhu/collaborative-notes/frontend/node_modules/vite/dist/node/chunks/config.js:28797:14) at async loadAndTransform (file:///C:/Users/madhu/collaborative-notes/frontend/node_modules/vite/dist/node/chunks/config.js:22670:26) at async viteTransformMiddleware (file:///C:/Users/madhu/collaborative-notes/frontend/node_modules/vite/dist/node/chunks/config.js:24542:20)
  - generic [ref=e8]:
    - text: Click outside, press Esc key, or fix the code to dismiss.
    - text: You can also disable this overlay by setting
    - code [ref=e9]: server.hmr.overlay
    - text: to
    - code [ref=e10]: "false"
    - text: in
    - code [ref=e11]: vite.config.ts
    - text: .
```