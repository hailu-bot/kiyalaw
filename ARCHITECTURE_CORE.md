# Kiya Law — Architecture Core

## Tech Stack & Infrastructure

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16.2.6 (App Router, Turbopack dev) |
| **Language** | TypeScript 5.x, React 19.2.4 |
| **Database ORM** | Prisma 6.19.3 (PostgreSQL, `lib/prisma/client.ts` singleton) |
| **Database Provider** | Supabase (Postgres via connection pooling, `DATABASE_URL` + `DIRECT_URL`) |
| **Auth** | Supabase Auth (client: `lib/supabase/client.ts`, server: `lib/supabase/server.ts`) |
| **Styling** | Tailwind v4 (`@import "tailwindcss"` + `@config "../tailwind.config.ts"`), custom design tokens |
| **UI Icons** | `lucide-react` ^1.16.0 |
| **Rich Text Editor** | TinyMCE v8 self-hosted (`public/tinymce.min.js`), React wrapper via `@tinymce/tinymce-react` ^6.3.0 |
| **PDF Generation** | `@react-pdf/renderer` ^4.5.1, `react-pdf-html` ^2.1.5 |
| **AI SDK** | `ai` ^6.0.189 + `@ai-sdk/groq` ^3.0.39 |
| **State** | Zustand ^5.0.13 |
| **Utilities** | `clsx` ^2.1.1, `tailwind-merge` ^3.6.0, `mammoth` ^1.12.0 (doc import) |
| **Path Alias** | `@/*` maps to project **root** (not `src/`) |

### Key Config Files
- `tailwind.config.ts` — custom tokens (spacing: `gutter`, `margin-mobile`; fonts: `headline-md`, `body-ui`, etc.)
- `next.config.ts` — Unsplash image remote pattern only
- `tsconfig.json` — path alias `@/*` → root
- `eslint.config.mjs` — ESLint 9 flat config

---

## Database Schema Map (Prisma)

### Core Business Models

```
Client (id, name, contactName, email, phone, status, ...)
  └─ hasMany Matter
       ├─ hasMany Activity (time|document|communication)
       ├─ hasMany Invoice
       │    ├─ hasMany InvoiceLineItem
       │    └─ hasMany InvoiceApproval
       ├─ hasMany TimeEntry
       └─ hasMany Document
            ├─ hasMany DocumentVersion (body stored as JSON)
            ├─ hasMany DocumentShare
            └─ belongsTo DocumentFolder (nested self-relation)
```

### Document System
```
Document (id, title, status[DocStatus], headVersionId -> DocumentVersion)
  ├─ DocumentVersion (id, body[Json], bodyText?, versionNumber, changeNote?)
  │    └─ Document.headVersion -> DocumentVersion (head pointer)
  ├─ DocumentShare (token, permissions, expiresAt)
  └─ DocumentFolder (name, parentId self-ref, children)
       → Unique constraint: [documentId, versionNumber]
```

### Enums
- **ClientStatus**: `Active | Inactive | Prospect`
- **MatterStatus**: `Active | Pending | Closed`
- **InvoiceStatus**: `Draft | PendingApproval | Approved | Finalized | Paid`
- **DocStatus**: `Draft | InReview | Finalized | Archived`
- **ActivityType**: `time | document | communication`
- **Role**: `PARTNER | ASSOCIATE | PARALEGAL | CLIENT`

---

## Routing & Directory Structure

### Route Groups
```
app/
├─ layout.tsx              # Root layout (html/body, h-screen overflow-hidden)
├─ page.tsx                # Dashboard (home)
├─ globals.css             # Tailwind v4 imports
├─ (auth)/                 # Unused (no layout.tsx)
│  ├─ auth/login/          # Login page
│  ├─ login/               # Alternative login page
│  ├─ register/            # Registration
│  └─ mfa/                 # Multi-factor auth
├─ (dashboard)/            # Main app shell (no layout.tsx — AppLayout wraps via root layout)
│  ├─ matters/             # Matter list + [matterId]/detail + /new
│  ├─ billing/             # Invoice list + [invoiceId]/detail + /new + /approvals
│  ├─ clients/             # Client list + [clientId]/detail
│  ├─ documents/           # Document drafter + /templates + /templates/[templateId] + /templates/msj
│  ├─ time/                # Time entries + /daily + /entries/[entryId] + /new
│  ├─ ai-matter/           # AI-assisted matter creation
│  ├─ automation/          # Automation hub + /settings
│  └─ settings/            # User settings
└─ api/
   ├─ health/              # Health check
   ├─ ai/draft/            # AI drafting endpoint (SSE streaming)
   ├─ documents/           # CRUD + [documentId]/versions + [documentId]/export + import
   └─ matters/             # Matters CRUD
```

### Key Architectural Note
The `(dashboard)` group has **no layout.tsx** — the sidebar and top nav are injected via `AppLayout.tsx` which is used in `app/layout.tsx`. This means **all routes** (including auth pages) get the sidebar unless they're explicitly excluded.

### Component Organization
```
components/
├─ layout/        AppLayout, Sidebar, TopNav, ToastContainer
├─ document/      TinyMceEditor, EditorToolbar, DMSSidebar, JurisAIPanel,
│                 AIDocumentEnhancements, StampModal, DocumentPDF, ImportButton
├─ invoice/       Invoice-related components
├─ matter/        Matter-related components
├─ client/        Client-related components
├─ time/          Time entry components
├─ automation/    Automation components
├─ settings/      Settings components
└─ ui/            Shared UI primitives (ToastContainer, etc.)
```

---

## State Management (Zustand)

### `useUIStore` (`lib/store/useUIStore.ts`)
- `sidebarCollapsed: boolean` — sidebar open/closed state
- `toggleSidebar: () => void` — toggle function
- `topNavContent: ReactNode | null` — dynamic content injected into TopNav bar
- `setTopNavContent: (content) => void`
- `isAiPanelOpen: boolean` — Juris AI panel visibility
- `toggleAiPanel: () => void` — toggle AI panel open/close

### `useDocumentStore` (`lib/store/useDocumentStore.ts`)
- Active document state: `documentId`, `title`, `status`, `matterId`
- Editor state: `editorHTML`, `isDirty`, `isSaving`, `lastSavedAt`
- Stamp system: `stamps[]`, `nextStampId`, `totalPages`
- AI chat state: `aiChatHistory: AiMessage[]`, `isAiTyping: boolean`
- Actions: `setDocument`, `setEditorHTML`, `setTitle`, `setDirty`, `setSaving`, stamp CRUD, `addAiMessage`, `updateLastAiMessage`, `setAiTyping`

### `useToastStore` (`lib/store/useToastStore.ts`)
- `toasts: Toast[]` — array of `{ id, message, type }`
- `addToast`, `removeToast` — push/dismiss notifications
- Auto-removal after 4s (except `pending` type)

---

## Core Application Modules

### 1. Billing & Invoicing — Status: Operational
- CRUD invoices, line items, approvals
- `app/(dashboard)/billing/` routes: list, detail, create, edit, approvals
- `app/lib/actions/billingActions.ts` — server actions
- `lib/services/invoiceApprovals.ts` — approval workflow logic

### 2. Document Management System (DMS) & Editor — Status: Active Development
- **Routes**: `app/(dashboard)/documents/` — full editor workspace
- **Editor**: TinyMCE v8 self-hosted (`public/tinymce.min.js`), iframe mode, custom React toolbar (`components/document/EditorToolbar.tsx`)
- **DMS sidebar**: Folder tree (`DocumentFolder` model) + document listing
- **Versioning**: `DocumentVersion` model with `body: Json` (HTML stored in `{ html: string }` format), head pointer via `Document.headVersionId`
- **Export**: PDF (`@react-pdf/renderer`), Word (.doc via Mammoth), Plain Text
- **Import**: `.docx` import via Mammoth (`/api/documents/import`)
- **Feature gap**: Templates, Track Changes, Comments, full AI drafting not yet wired

### 3. Matter & Client Management — Status: Operational
- Full CRUD matters (status: Active/Pending/Closed) with activity timeline
- Full CRUD clients (status: Active/Inactive/Prospect)
- Time entry tracking per matter
- Server actions in `app/lib/actions/matterActions.ts`, `clientActions.ts`

### 4. AI Integrations (Juris AI) — Status: Operational (Chat Wired)
- **AI Drafting**: `/api/ai/draft` — Groq-powered SSE streaming, formalize/simplify/reformat/review/prompt-based
- **AI Enhancement modal**: `AIDocumentEnhancements` component — 6 presets (formalize, simplify, reformat, clauses, review, custom)
- **Juris AI Side Panel**: Wired to Zustand `useDocumentStore`; chat input sends prompts to `/api/ai/draft` and streams SSE responses into `aiChatHistory` in real time. Panel uses floating dropdown layout (`absolute right-8 top-[80px]`) toggled globally via `useUIStore.isAiPanelOpen`/`toggleAiPanel`
- **AI Matter creation**: `/ai-matter` route

### 5. Automation Hub — Status: Static UI
- `/automation` and `/automation/settings` — frontend-only, no backend logic

### 6. Time Tracking — Status: Operational
- Time entries per matter, daily view, CRUD
- `app/lib/actions/timeActions.ts` — server actions

---

## Layout Architecture

```
RootLayout (app/layout.tsx)
  └─ <body h-screen overflow-hidden>
       └─ AppLayout (components/layout/AppLayout.tsx) — 'use client'
            ├─ Sidebar (fixed left-0, w-64/w-20, bg-[#0A1128])
            └─ <main flex-1 flex-col h-screen overflow-y-auto>
                 ├─ TopNav (sticky top-0, z-30)
                 │    └─ toggleSidebar button (ChevronLeft)
                 └─ <div flex-1> {children} </div>
```

The `<main>` uses dynamic `md:ml-64` / `md:ml-20` based on `useUIStore.sidebarCollapsed` to compensate for the `fixed` sidebar.

---

## Current Active Issues

### Fixed — Document UI Layout (Session 5/23)
1. **Global sidebar overlap** — Restored `useUIStore` import in `AppLayout.tsx`; `<main>` now has dynamic `md:ml-64`/`md:ml-20` margin, matching the `fixed` sidebar width
2. **TopNav toggle hidden on small screens** — Removed `hidden md:flex` from `TopNav.tsx`; toggle button (ChevronLeft) now visible at all viewport widths
3. **TinyMCE dead canvas on mount** — Removed `mounted` SSR guard (useEffect/useState race condition); `tinymceScriptSrc="/tinymce.min.js"` (file actually on disk); `height: 1080` (numeric, not CSS %); `initialValue="<p><br></p>"` fallback; `inline: false` (iframe mode)
4. **Letterhead overlay** — Removed all custom letterhead `<header>` HTML from editor page; TinyMCE renders directly inside a clean `w-[850px] h-[1100px]` white paper div
5. **AI panel layout** — Moved to `fixed inset-y-0 right-0 z-40` overlay (no longer fights flexbox grid)
6. **Double-layout nesting** — page.tsx renders a simple flex column (no nested `<aside>`/`<main>`)
7. **Build & Lint** — Both pass (build: 0 errors, lint: 0 errors/0 warnings)
8. **TinyMCE 8 iframe invisible (zero-height)** — **ROOT CAUSE**: `skin: false` is unsupported in TinyMCE 6+; editor creates the wrapper div but the editing iframe has `height: 0` because no skin CSS applies `display: flex` layout. **FIX**: Removed `skin: false`, added `skin_url: '/skins/ui/oxide'`, created minimal skin CSS at `public/skins/ui/oxide/skin.min.css` with essential flexbox sizing for `.tox-tinymce`, `.tox-editor-container`, `.tox-edit-area`, and `.tox-edit-area__iframe`. Also added minimal `content.min.css` as TinyMCE 8 expects both files in the skin directory.

### Fixed — Editor Save Lifecycle (Sprint 2)
1. **`isDirty` state thrashing** — `handleEditorChange` now compares new HTML string against previous Zustand `editorHTML` before setting dirty, avoiding false positives from TinyMCE parser round-trips and internal state quirks
2. **Native editor dirty sync** — `resetNativeEditorDirty()` module-level function calls `editor.setDirty(false)` after every save (both auto-save and manual save), keeping Zustand and TinyMCE internal dirty state in sync
3. **EditorAPI expanded** — Added `on`, `off`, `queryCommandState`, `setDirty`, `isDirty`, `dom`, `selection.getStart`, `setContent`, and `undoManager` to the `EditorAPI` interface for compatibility with `EditorToolbar`'s richer type expectations and document loading support

### Fixed — Document Loading & Save Loop (Sprint 3)
1. **Load guard prevents save loop** — `loadingRef.current` suppresses `handleEditorChange` during programmatic `setContent()`, preventing auto-save from firing on loaded documents
2. **DMS sidebar document click renders in editor** — Added `useEffect` watching `documentId`; when user clicks a different document in DMS sidebar, calls `editorRef.current.setContent(html)`, then `setDirty(false)` + `undoManager.clear()` to prevent undo into previous document
3. **Reliable dirty detection** — Replaced `editor.isDirty()` guard with direct HTML string comparison (`prevHtml !== _html`), eliminating TinyMCE dirty-state desync as a failure mode

### Fixed — Hydration, AI Layout & Toggle (Sprint 4)
1. **TinyMCE hydration mismatch** — Added `id="kiya-law-core-editor"` to the `<Editor>` component, forcing SSR and client to use the same DOM ID and preventing React hydration errors that previously broke editor event bindings
2. **AI panel global toggle** — Added `isAiPanelOpen` / `toggleAiPanel` to `useUIStore`; EditorToolbar AI button now calls `toggleAiPanel` (open → close) instead of one-way `onAskAI` (open only)
3. **AI panel floating layout** — JurisAIPanel wrapper changed from fixed sidebar (`w-[320px] border-l`) to floating dropdown (`absolute right-8 top-[80px] w-[400px] max-h-[80vh] rounded-xl shadow-2xl`); panel renders inside the relative document container instead of as a fixed overlay

### Known Issues
- `P1001` error during `next build` page generation — expected (Supabase DB not accessible in CI); does not affect runtime
- Track Changes and Comment buttons in toolbar are decorative (plugins not installed)
- Zoom controls and line spacing selector are UI-only (not wired to editor)
- TinyMCE self-hosted script is `public/tinymce.min.js` (root-level); skin CSS at `public/skins/ui/oxide/{skin,content}.min.css`
