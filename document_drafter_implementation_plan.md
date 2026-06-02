# Document Drafter — Technical Implementation Plan

## 1. Database Schema (Prisma)

### New Models

```prisma
/// Attorney / User profile linked to Clerk or Supabase Auth
model User {
  id        String     @id @default(cuid())
  email     String     @unique
  name      String?
  avatarUrl String?
  createdAt DateTime   @default(now())

  documents    Document[]
  versions     DocumentVersion[]
}

/// Associates a draft to a specific Matter + Client
model Document {
  id          String   @id @default(cuid())
  title       String
  matterId    String?
  matter      Matter?  @relation(fields: [matterId], references: [id], onDelete: SetNull)
  authorId    String
  author      User     @relation(fields: [authorId], references: [id])
  status      DocStatus @default(Draft)

  // "active" content — points to the current head version
  headVersionId String?
  headVersion   DocumentVersion? @relation("HeadVersion", fields: [headVersionId], references: [id])

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  versions    DocumentVersion[]
}

/// Every save / auto-save snapshots the full TipTap JSON here
model DocumentVersion {
  id         String   @id @default(cuid())
  documentId String
  document   Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
  authorId   String
  author     User     @relation(fields: [authorId], references: [id])

  // TipTap JSON body — stored as a raw JSON string for flexibility
  body       Json
  // Optional plain-text extract for search / preview
  bodyText   String?

  versionNumber Int
  changeNote   String?
  createdAt    DateTime @default(now())

  // Inverse relation for the active head pointer
  headFor   Document? @relation("HeadVersion")

  @@unique([documentId, versionNumber])
  @@index([documentId])
}

enum DocStatus {
  Draft
  InReview
  Finalized
  Archived
}
```

### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| `body` is stored as `Json` (PostgreSQL `jsonb`) | TipTap's native output is a ProseMirror JSON doc — no serialization/deserialization overhead |
| `bodyText` for search | Plain-text extract for full-text search or snippet preview without parsing JSON |
| `versionNumber` is scoped per document (`@@unique([documentId, versionNumber])`) | Simpler than a UUID; increment on each save |
| `document.headVersionId` | Allows a quick read of the latest version without ordering/filtering versions; updated on every save |
| `matterId` is nullable | Supports standalone documents not yet linked to a matter |

---

## 2. Editor Architecture (TipTap Integration)

### Replace `contentEditable` div with `<TipTapEditor>`

Create `components/document/TipTapEditor.tsx` (client component) that renders `@tiptap/react`'s `<EditorContent>`.

### Installed Dependencies

```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-underline \
  @tiptap/extension-placeholder @tiptap/extension-highlight @tiptap/extension-typography \
  @tiptap/extension-text-align @tiptap/pm
```

### Extensions

| Extension | Purpose |
|-----------|---------|
| `StarterKit` | Bold, Italic, Strike, Heading, BulletList, OrderedList, Blockquote, Code, History |
| `Underline` | Underline button support |
| `Placeholder` | "Start drafting..." placeholder when empty |
| `Highlight` | Mark text with a highlight color (used for AI-suggested ranges) |
| `Typography` | Auto-correct smart quotes, dashes, ellipsis |
| `TextAlign` | `AlignLeft` / `AlignJustify` from the toolbar |

### Toolbar Binding

The existing static toolbar buttons (Bold, Italic, Underline, etc.) will call `editor.chain().toggleBold().run()`, `editor.chain().toggleItalic().run()`, etc.

### Tailwind Styling

- The `<EditorContent>` wrapper receives a custom class. ProseMirror-generated elements are styled via Tailwind, e.g.:
  - `& h1 { @apply font-headline-sm text-[20px] font-bold mt-10 mb-4 }`
  - `& p { @apply font-body-md text-[15px] mb-6 leading-[1.8] }`
- These styles live in `components/document/editor-styles.css` as a global stylesheet (imported in `layout.tsx` or via CSS modules).

### AI Suggestion Rendering

- TipTap's `NodeView` API is used to render the "AI Suggestion" block as a custom node (`aiSuggestion`).
- The node stores the suggested text as a `text` attribute, and its NodeView renders the gold-bordered `<div>` with Accept / Reject buttons.
- On Accept → the node is replaced with plain paragraph content. On Reject → the node is removed.

---

## 3. AI Assistant Integration Strategy

### Flow

```
User highlights text (or leaves cursor) + types prompt →
  Frontend captures editor state →
  POST /api/ai/draft { prompt, context, selection } →
  Vercel AI SDK streams LLM response →
  Client receives stream chunks →
  TipTap inserts aiSuggestion node
```

### API Endpoint: `app/api/ai/draft/route.ts`

- Receives `{ prompt: string, context: DocJSON, selection: { from, to } | null }`
- Uses the Vercel AI SDK's `streamText` with Groq via `@ai-sdk/groq`
- Returns a `StreamingTextResponse` (Server-Sent Events)

```ts
import { streamText } from 'ai';
import { createGroq } from '@ai-sdk/groq';

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  const { prompt, context, selection } = await req.json();
  const systemPrompt = `You are a legal drafting assistant...`;

  const result = streamText({
    model: groq('llama3-70b-8192'), // Llama 3 70B for high-quality legal prose
    system: systemPrompt,
    prompt,
  });

  return result.toDataStreamResponse();
}
```

> **Environment Variable:** Add `GROQ_API_KEY=your_groq_api_key_here` to `.env.local`.

### Client-Side (DocumentDrafter.tsx)

- On "Send" button click or Enter in the textarea:
  1. Serialize the current TipTap JSON with `editor.getJSON()`.
  2. Capture `editor.view.state.selection` ranges if text is highlighted.
  3. POST to `/api/ai/draft` via the Vercel AI SDK's `useCompletion` hook or a manual `fetch` + `readableStream` reader.
  4. Accumulate the streamed text.
  5. When the stream completes, insert a new `aiSuggestion` node at the cursor position:
     ```ts
     editor.commands.insertContent({
       type: 'aiSuggestion',
       attrs: { text: accumulatedReply },
     });
     ```

### Vercel AI SDK Packages

```bash
npm install ai @ai-sdk/groq
```

### Prompt Engineering

- The server-side system prompt instructs the LLM to return **plain legal prose** (no markdown, no JSON fencing).
- If the user highlighted text, the prompt includes the selected text with a note like "The following section is selected for revision: ...".

---

## 4. Global State & Data Fetching

### Zustand Document Store: `lib/store/useDocumentStore.ts`

```ts
interface DocumentState {
  // Core
  documentId: string | null;
  title: string;
  status: DocStatus;
  matterId: string | null;

  // TipTap JSON — the single source of truth for both panes
  editorJSON: JSONContent | null;

  // UI
  isDirty: boolean;
  isSaving: boolean;
  lastSavedAt: Date | null;
  sealActive: boolean;

  // Actions
  setDocument: (doc: ...) => void;
  setEditorJSON: (json: JSONContent) => void;
  setTitle: (t: string) => void;
  setDirty: (d: boolean) => void;
  setSealActive: (a: boolean) => void;
}
```

**Why Zustand over Context**: Zustand avoids re-render cascades; the A4 preview pane can subscribe to `editorJSON` without re-rendering the toolbar.

### Data Flow

```
TipTapEditor ──(onUpdate)──> useDocumentStore.setEditorJSON(json)
                                        │
                          ┌──────────────┼──────────────┐
                          ▼              ▼              ▼
                    DocumentDrafter   A4Preview     AI Assistant
                    (toolbar,        (re-renders    (reads context
                     chat panel)      JSON→HTML)     for prompt)
```

### API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/documents` | `GET` | List user's documents |
| `/api/documents` | `POST` | Create new document (with optional `matterId`) |
| `/api/documents/[id]` | `GET` | Fetch document + head version |
| `/api/documents/[id]` | `PATCH` | Update title, status, matterId |
| `/api/documents/[id]/versions` | `POST` | Save a new version (auto-save) |
| `/api/ai/draft` | `POST` | Stream AI-generated draft |
| `/api/documents/[id]/export` | `GET` | Export as PDF (returns file) |

### Auto-Save

- A `useEffect` in the parent page watches `isDirty` and `editorJSON` changes.
- After 3 seconds of inactivity (debounce via a simple setTimeout / `useDebounce` hook), it POSTs to `/api/documents/[id]/versions`.
- On success: `setDirty(false)`, `lastSavedAt = now()`.

### PDF Export

- Server route uses `html-pdf-node` or `puppeteer` to render the TipTap JSON → styled HTML → PDF buffer.
- Alternative: client-side `window.print()` with `@media print` CSS for a simpler initial approach.

---

## 5. Component Tree (Updated)

```
app/(dashboard)/documents/page.tsx
├── Top Toolbar (title, seal toggle, export, save)
├── Flex Row
│   ├── DocumentDrafter (55%)
│   │   ├── Editor Toolbar (B, I, U, lists, etc.)
│   │   ├── TipTapEditor ← replaces contentEditable div
│   │   └── AI Assistant Panel (textarea + suggestions)
│   └── A4Preview (45%)
│       ├── Zoom Controls
│       └── A4 Paper (re-renders from store.editorJSON)
```

---

## 6. Migration Path

1. **Phase 1** — Prisma schema + migration (`npx prisma migrate dev`)
2. **Phase 2** — Zustand store + TipTap install + basic editor mount
3. **Phase 3** — Toolbar wiring (bold, italic, etc.)
4. **Phase 4** — A4Preview subscribes to store (render JSON → HTML via TipTap's `generateHTML` or a shared renderer)
5. **Phase 5** — Auto-save + `/api/documents/[id]/versions`
6. **Phase 6** — `/api/ai/draft` + streaming + `aiSuggestion` NodeView
7. **Phase 7** — Export (client print or server PDF)

---

## 7. Dependencies to Install

```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-underline \
  @tiptap/extension-placeholder @tiptap/extension-highlight \
  @tiptap/extension-typography @tiptap/extension-text-align @tiptap/pm \
  ai @ai-sdk/groq
```
