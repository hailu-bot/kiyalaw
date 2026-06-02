# Document Drafter — Architectural Update Plan (Modules 1–5)

---

## MODULE 1: Core State Fixes & Blank Document Initialization

### 1.1 Blank Document State

**Current problem:** Creating a "Blank Document" goes to `/documents` which auto-creates a record with hardcoded title `"Mutual Non-Disclosure Agreement"` and TipTap initializes with `defaultContent` containing `"Start typing here..."` text. The title in the toolbar `<h2>` is a static text node, not editable.

**Fix — truly empty editor:**

1. **Remove `defaultContent` from `TipTapEditor.tsx`** — when `initialContent` is null/undefined, pass `undefined` to `useEditor({ content: undefined })`. TipTap natively starts with an empty doc (single empty paragraph). This removes the placeholder text.

2. **Make the toolbar title an inline editable input:**
   - Replace the `<h2>` in `app/(dashboard)/documents/page.tsx` header with:
     ```tsx
     <input
       value={title}
       onChange={(e) => setTitle(e.target.value)}
       className="font-headline-sm text-[24px] font-bold text-[#0A1128] tracking-tight bg-transparent border-none outline-none"
     />
     ```
   - On blur or on change (debounced 1s), call `PATCH /api/documents/[id]` with the new title via the `updateDocumentTitle` server action.

3. **Remove automatic document creation on mount.** The `useEffect` that POSTs to `/api/documents` on first load will be removed. Instead, the page checks for a `documentId` search param. If absent, it shows a "New Document" state. The document is created explicitly when the user types (auto-create on first keystroke) or via the save button.

4. **Update `createDocument` server action** to accept an optional `body` param. When omitted, the document is created without an initial version — the first auto-save will create version 1.

### 1.2 Template Preview Mechanism

**Current problem:** `PleadingTemplateDetails.tsx` has a "Preview" button with no handler. Template detail pages show only a static list of section names.

**Fix — preview modal:**

1. **Create `TemplatePreviewModal.tsx`** at `components/document/TemplatePreviewModal.tsx`:
   - Triggered by the "Preview" button on template detail pages.
   - Receives a `templateId` prop and maps it to a pre-baked TipTap-compatible JSON content object.
   - Renders a full-screen modal with a read-only TipTap editor instance (`editable: false`).
   - Shows the document with the Kiya Law letterhead and formatted sections.
   - "Use This Template" and "Close" buttons in the footer.

2. **Template content map:** Create `lib/data/templateContents.ts` that exports a `Record<string, JSONContent>` mapping template IDs to their TipTap JSON body. Start with the NDA content currently hardcoded in A4Preview's fallback.

3. **Route integration:** The "Preview" button in `PleadingTemplateDetails.tsx` sets a `showPreview` state to true, rendering the modal. The "Use This Template" Link navigates to `/documents?template=X` where the documents page reads the search param and loads the template JSON into the editor.

### 1.3 AI Injection Fix

**Current problem:** The `sendAiPrompt` function in `DocumentDrafter.tsx` accumulates streamed bytes but the Vercel AI SDK's `toDataStreamResponse()` returns SSE-formatted chunks (`data: "...\n\n"`). The current regex `accumulated.replace(/^data:\s*/gm, '').trim()` only strips the first occurrence and doesn't handle the full SSE protocol properly.

**Fix — use the Vercel AI SDK `useCompletion` hook or properly parse the SSE stream:**

1. **Replace manual `fetch` + `reader.read()` with the `useCompletion` hook from `ai/react`:**
   ```ts
   import { useCompletion } from 'ai/react';
   
   const { complete, completion, isLoading } = useCompletion({
     api: '/api/ai/draft',
   });
   ```
   On send: `complete(prompt, { body: { context: editorJSON, selection } })`.
   The `completion` string is the accumulated, clean text.

2. **Alternative — manual SSE parsing** if we want to keep the custom UI:
   - Read the stream line-by-line.
   - Skip lines starting with `data: "[DONE]"`.
   - Parse `data: {...}` JSON lines and extract `choices[0].delta.content`.

3. **Injection command** (correct as-is):
   ```ts
   editor.commands.insertAiSuggestion(cleaned);
   ```
   This calls the custom `AiSuggestion` command which inserts an `aiSuggestion` node at the cursor position. The NodeView renders Accept/Reject.

---

## MODULE 2: Advanced Editor UI & Resizable Workspace

### 2.1 Expanded TipTap Toolbar

**Extensions to add (install new packages):**

| Extension | Package | Purpose |
|---|---|---|
| `@tiptap/extension-table` | `@tiptap/extension-table` `@tiptap/extension-table-row` `@tiptap/extension-table-cell` `@tiptap/extension-table-header` | Insert and format legal tables (exhibit lists, fee schedules) |
| `@tiptap/extension-table` | — see above | — |
| `@tiptap/extension-text-align` | already installed | Already wired; add `justify` option |
| `@tiptap/extension-indent` | `@tiptap/extension-indent` | Indent/outdent paragraphs (legal paragraph indentation) |
| `@tiptap/extension-line-height` | `@tiptap/extension-line-height` | Double-space vs single-space options |
| `@tiptap/extension-hard-break` | (included in StarterKit) | `Shift+Enter` soft break |
| `@tiptap/extension-horizontal-rule` | (included in StarterKit) | Section break `<hr>` |
| `@tiptap/extension-font-family` | `@tiptap/extension-font-family` | Serif vs sans-serif selection |
| `@tiptap/extension-font-size` | `@tiptap/extension-font-size` | Font size dropdown |
| `@tiptap/extension-bullet-list` | (included in StarterKit) | Already wired |
| `@tiptap/extension-ordered-list` | (included in StarterKit) | Already wired |
| Custom `PageBreak` extension | local | Inserts a CSS page-break marker for print layout |

**New toolbar layout (row 1 + collapsible row 2):**

```
Row 1: [Style: p/h1/h2/h3] [B] [I] [U] [S]  |  [Bullet] [Ordered] [Indent] [Outdent]  |  [Align L/C/R/J]
Row 2: [Table] [HR] [PageBreak] [LineHeight: 1.0/1.5/2.0] [FontSize]  |  [Undo] [Redo]
```

The toolbar will be split into a primary row (always visible) and a secondary "..." overflow dropdown or a toggle-able second row via a `chevron-down` button.

### 2.2 Draggable Split-Screen

**Library:** `react-resizable-panels` (by bvaughn, from the React Team)

```bash
npm install react-resizable-panels
```

**Integration:**

1. **Replace the current flex container** `flex-1 flex flex-col lg:flex-row` in `documents/page.tsx` with:
   ```tsx
   import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
   
   <PanelGroup direction="horizontal" className="flex-1">
     <Panel defaultSize={55} minSize={30} maxSize={80}>
       <DocumentDrafter />
     </Panel>
     <PanelResizeHandle className="w-1.5 bg-[#c6c6ce]/40 hover:bg-[#D4AF37] transition-colors cursor-col-resize" />
     <Panel defaultSize={45} minSize={20} maxSize={70}>
       <A4Preview sealActive={sealActive} />
     </Panel>
   </PanelGroup>
   ```

2. **Remove the percentage width classes** from `DocumentDrafter` (`w-full lg:w-[55%]`) and `A4Preview` (`w-[45%]`). The panels handle sizing natively.

3. **Persist panel sizes** to localStorage so the user's preferred split ratio survives page reloads:
   ```tsx
   <PanelGroup
     direction="horizontal"
     onLayout={(sizes) => localStorage.setItem('editor-panel-layout', JSON.stringify(sizes))}
   >
   ```
   Read saved sizes on mount.

---

## MODULE 3: A4 Print Engine & Digital Stamping

### 3.1 A4 Page Simulation

**Current problem:** A4Preview renders a single fixed container (`max-w-[750px] min-h-[1050px]`) with overflow-hidden. Content that exceeds one page is clipped, not paginated.

**Fix — true multi-page simulation with CSS columns or page-break logic:**

1. **Remove `overflow-hidden` and `min-h-[1050px]`** from the paper container.
   - Instead, wrap content in a scrollable container.
   - **No forced single-page height.** Content flows naturally.

2. **Introduce a `PageBreak` TipTap extension** that inserts:
   ```html
   <div class="page-break" style="page-break-after: always; break-after: page; height: 0;"></div>
   ```
   Users can insert page breaks via the toolbar button.

3. **Simulate A4 pages** by rendering a sequence of "pages":
   - After the editor JSON is converted to HTML via `generateHTML`, split the HTML on `.page-break` or `page-break-after` elements.
   - Render each segment in a separate A4-sized `<div>` with `max-w-[750px] min-h-[1050px] shadow-lg border mb-8`.
   - This gives a visual multi-page feel. Without explicit page breaks, the whole content renders in a single overflow container.

4. **CSS approach for print:**
   ```css
   @media print {
     .preview-page { page-break-after: always; box-shadow: none; border: none; }
     .page-break { display: none; }
   }
   ```

### 3.2 Headers, Footers & Pagination

**Current problem:** The letterhead and footer are rendered once in the DOM as part of the content, meaning on multi-page printouts the header/footer only appears on the first page.

**Solution — CSS `@page` + `@media print` running elements:**

1. **In the export route** (`/api/documents/[id]/export`), render the document as HTML with:
   ```html
   <style>
     @page { 
       margin: 20mm 15mm; 
       @top-center { content: element(header); }
       @bottom-center { content: counter(page); }
     }
     @media print {
       .letterhead { position: running(header); }
       .page-footer { position: running(footer); }
     }
   </style>
   ```
   **Caveat:** Support for `position: running()` is limited to PrinceXML and some print drivers. For broader compatibility:
   - Use a **server-side approach**: render each page with a fixed header/footer using a puppeteer/playwright script.
   - Or use the **client-side `react-to-print`** approach: render hidden HTML with repeated headers.

2. **Recommended practical approach** for MVP:
   - The letterhead is baked into the top of the exported HTML once.
   - Footer includes "Page 1 of X" using JavaScript (count page breaks client-side).
   - For `npm run print` PDF, use `react-to-print` which clones the preview DOM and triggers browser print.

### 3.3 Digital Seal

**Current:** Uses `lucide-react` `<Shield>` icon with `opacity-10`. Not realistic.

**Fix — realistic seal overlay:**

1. **Replace icon with an actual PNG/SVG stamp image**:
   - Place `/public/seal-kiya-law.png` in the project.
   - Render it as:
     ```tsx
     <img
       src="/seal-kiya-law.png"
       alt="Digital Seal"
       className="absolute right-12 top-48 pointer-events-none select-none w-[180px] h-[180px] mix-blend-multiply opacity-0 transition-all duration-500"
       style={{ opacity: sealActive ? 0.15 : 0 }}
     />
     ```

2. **`mix-blend-multiply`** on the `img` makes the seal darken underlying text/signatures without white-boxing them. The seal sits behind the text layer (`z-index: 0` relative to content `z-index: 1`).

3. **Position** should be adjustable — store seal X/Y offsets in the Zustand store (future enhancement).

### 3.4 PDF Export

**Recommended approach:** `react-to-print` for MVP, Puppeteer for production.

1. **`react-to-print`** (client-side):
   ```bash
   npm install react-to-print
   ```
   - Create a `PrintProvider` component that renders a hidden clone of A4Preview with full A4 CSS.
   - On "Export → PDF", call `handlePrint()` which opens the browser print dialog.
   - User selects "Save as PDF" as the destination printer.
   - Pros: zero server cost, uses browser's built-in PDF engine.
   - Cons: depends on browser print dialog.

2. **Server-side Puppeteer/Playwright** (production):
   - New route: `POST /api/documents/[id]/export/pdf`
   - Spawns a headless browser, loads the rendered HTML, calls `page.pdf()`.
   - Returns the PDF buffer as a download.
   - Pros: pixel-perfect, server-controlled.
   - Cons: ~150MB puppeteer dependency, cold-start latency.

3. **MVP plan:** Ship with `react-to-print`. Add a server-side endpoint later using a lightweight alternative like `@xeokit/print-pdf` or the native `@js-pdf/PDFDocument` for simpler layouts.

---

## MODULE 4: Document Management System (Folders & Navigation)

### 4.1 Database Schema Update

Add to `prisma/schema.prisma`:

```prisma
model Folder {
  id          String     @id @default(cuid())
  name        String
  parentId    String?
  parent      Folder?    @relation("FolderTree", fields: [parentId], references: [id], onDelete: Cascade)
  children    Folder[]   @relation("FolderTree")
  documents   Document[]
  authorId    String
  author      User       @relation(fields: [authorId], references: [id])
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  @@index([parentId])
  @@index([authorId])
}
```

Update `Document` model — add `folderId`:

```prisma
model Document {
  // ... existing fields ...

  folderId   String?
  folder     Folder?  @relation(fields: [folderId], references: [id], onDelete: SetNull)

  @@index([folderId])
}
```

**Prisma actions to add:**

- `createFolder(name, parentId?)`
- `listFolders(authorId)` — returns root folders + nested children
- `moveDocumentToFolder(documentId, folderId)`
- `deleteFolder(id)` — cascades to children and sets `folderId = null` on documents

### 4.2 DMS UI — New Routes + Component

**New route:** `app/(dashboard)/documents/list/page.tsx`

- File explorer style split view:
  - **Left sidebar (260px):** Folder tree with chevron expand/collapse, "New Folder" button at top.
  - **Right content area:** Document cards in a grid or table view with columns: Title, Status (Draft/InReview/Finalized), Last Modified, Matter.

**Component tree:**

```
documents/list/page.tsx
├── FolderTree (left sidebar)
│   ├── FolderNode (recursive — handles nesting)
│   │   ├── expand/collapse chevron
│   │   ├── folder name (click to filter)
│   │   └── context menu (rename, delete)
│   └── NewFolderButton
│       └── inline input → createFolder action
├── DocumentGrid (right area)
│   ├── SearchBar (filters by title)
│   ├── SortDropdown (date, title, status)
│   └── DocumentCard[]
│       ├── icon, title, status badge, date
│       └── click → router.push(`/documents?id=${id}`)
└── EmptyState (when no documents)
```

**Navigation integration:**

- Add a "My Documents" link in the sidebar (`Component/layout/Sidebar.tsx`) pointing to `/documents/list`.
- The existing `/documents` route becomes the dedicated editor workspace, accessed when opening a document from the list.

### 4.3 Folder Backend Actions

Create `app/actions/folderActions.ts`:

```ts
export async function createFolder(name: string, parentId?: string) { ... }
export async function getFolderTree(userId: string) { ... } // returns nested structure
export async function moveDocument(documentId: string, folderId: string | null) { ... }
export async function renameFolder(folderId: string, name: string) { ... }
export async function deleteFolder(folderId: string) { ... } // soft-cascade
```

API routes mirroring the actions under `/api/folders/`.

---

## MODULE 5: External File Import (Local & Google Drive)

### 5.1 Local Word Docs (.docx)

**Library:** `mammoth.js`

```bash
npm install mammoth
```

**Flow:**

1. **New button** in the toolbar or DMS list: "Import" → file picker (`accept=".docx,.doc"`).
2. **Client-side parsing** via `mammoth`:
   ```ts
   import mammoth from 'mammoth';
   
   const arrayBuffer = await file.arrayBuffer();
   const result = await mammoth.convertToHtml({ arrayBuffer });
   // result.value contains the HTML string
   ```
3. **HTML → TipTip JSON conversion**:
   - Use a lightweight HTML-to-ProseMirror converter, e.g.:
     ```
     npm install @tiptap/html
     ```
     We already have `generateHTML`. The reverse is needed: `generateJSON` from `@tiptap/html` can parse HTML into TipTap-compatible JSON:
     ```ts
     import { generateJSON } from '@tiptap/html';
     
     const json = generateJSON(result.value, editorExtensions);
     ```
   - Replace the editor content:
     ```ts
     editor.commands.setContent(json);
     ```
4. **Server-side option** (for large files): POST the file to `/api/documents/import/docx` which runs mammoth on the server and returns the JSON.

**Limitations of mammoth:**
- Converts .docx to clean HTML. Complex formatting (tables with merged cells, tracked changes) may lose fidelity.
- For production, consider `docx4js` or a commercial converter.

### 5.2 Google Drive Integration

**High-level flow:**

1. **Google Cloud Console setup:**
   - Create a project, enable Google Drive API.
   - Create OAuth 2.0 credentials (Web application type).
   - Add authorized redirect URI: `https://[domain]/api/auth/google/callback`.
   - Store `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env.local`.

2. **Google Picker API** (simpler than full Drive API):
   - Load the Picker JS library on the client.
   - On "Import from Drive" click:
     ```ts
     const picker = new google.picker.PickerBuilder()
       .addView(google.picker.ViewId.DOCS)
       .setOAuthToken(accessToken)
       .setCallback((data) => {
         if (data.action === 'picked') {
           const fileId = data.docs[0].id;
           // fetch file content server-side
         }
       })
       .build();
     picker.setVisible(true);
     ```

3. **Backend route** `GET /api/documents/import/google?fileId=XYZ`:
   - Uses a service account (with Drive API enabled) to download the file.
   - For `.docx` files, runs mammoth.js conversion server-side.
   - Returns the TipTap JSON to the client, which calls `editor.commands.setContent(json)`.

4. **Token storage:**
   - Google Picker requires an OAuth access token.
   - For MVP, use a one-time token flow: user authenticates via the frontend using `gapi.auth2` and the token is passed directly to the Picker (not stored server-side).

**Dependencies:**
- `@googleapis/drive` (server-side downloads)
- Google Picker API loaded via `<script>` tag in layout or dynamically.

---

## Dependency Installation Summary

```bash
# Module 2 — resizable panels
npm install react-resizable-panels

# Module 2 — extra TipTap extensions
npm install @tiptap/extension-table @tiptap/extension-table-row \
  @tiptap/extension-table-cell @tiptap/extension-table-header \
  @tiptap/extension-indent @tiptap/extension-line-height \
  @tiptap/extension-font-family @tiptap/extension-font-size

# Module 3 — client-side PDF
npm install react-to-print

# Module 5 — .docx import
npm install mammoth

# Module 5 — Google Drive (server-side)
npm install @googleapis/drive
```

---

## Summary of New/Modified Files

| File | Module | Action |
|---|---|---|
| `components/document/TemplatePreviewModal.tsx` | 1.2 | Create |
| `lib/data/templateContents.ts` | 1.2 | Create |
| `lib/data/import/docx.ts` | 5.1 | Create |
| `lib/hooks/useCompletion.ts` | 1.3 | Create (or use `ai/react`) |
| `lib/editor/extensions.ts` | 2.1 | Update (add table, indent, etc.) |
| `lib/editor/PageBreak.ts` | 2.1 | Create |
| `lib/store/useDocumentStore.ts` | 1.1, 4.1 | Update (add `folderId`, `isEditingTitle`) |
| `components/document/DocumentDrafter.tsx` | 2.1 | Update toolbar |
| `app/(dashboard)/documents/page.tsx` | 1.1, 2.2 | Title editable, resizable panels |
| `components/document/A4Preview.tsx` | 3.1, 3.2, 3.3 | Multi-page, real seal |
| `app/globals.css` | 3.1, 3.3 | Add print/page styles |
| `prisma/schema.prisma` | 4.1 | Add `Folder` model, `folderId` on Document |
| `app/actions/folderActions.ts` | 4.2 | Create |
| `app/(dashboard)/documents/list/page.tsx` | 4.2 | Create |
| `components/dms/FolderTree.tsx` | 4.2 | Create |
| `components/dms/DocumentGrid.tsx` | 4.2 | Create |
| `components/layout/Sidebar.tsx` | 4.2 | Update (add "My Documents" link) |
| `app/api/documents/import/docx/route.ts` | 5.1 | Create |
| `app/api/documents/import/google/route.ts` | 5.2 | Create |
