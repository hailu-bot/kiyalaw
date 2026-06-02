# Unified Diagnostic & Architecture Plan

## Part 1: Immediate Bug Diagnostics (Fix First)

### Bug 1: Dead Split-Pane Resizer
**Root Cause**: In `app/(dashboard)/documents/page.tsx`, the layout imports `Group` and `Separator` from the `react-resizable-panels` library. However, `react-resizable-panels` v4 does not export these components; the correct exports are `PanelGroup` and `PanelResizeHandle`. Because `PanelResizeHandle` is missing, the necessary mouse/touch event listeners for dragging are never attached to the DOM, leaving the border as a static element that only responds to CSS hover states.
**Fix**: Refactor the imports to use `PanelGroup` and `PanelResizeHandle`, and replace the `<Group>` and `<Separator>` tags accordingly.

### Bug 2: Hardcoded/Empty Templates
**Root Cause**: There is a hardcoded ID mismatch between the UI and the data layer. In `TemplateGallery.tsx`, the Mutual NDA template has the ID `'nda'`. However, in `lib/data/templateContents.ts`, the template JSON is stored under the key `'mutual-nda'`. When a user clicks "Use Template", the app looks for `templateContents['nda']`, finds nothing, and leaves the editor state empty. The `A4Preview` component then detects the empty state and falls back to rendering the dummy `EmptyDocument` component, which contains hardcoded NDA text.
**Fix**: Unify the template IDs (e.g., change `'nda'` to `'mutual-nda'` in the Gallery) and remove the `EmptyDocument` fallback to ensure actual TipTap JSON is rendered.

### Bug 3: Custom Template Workflow
**Root Cause**: The application currently relies on a static `templateContents.ts` file and lacks a database-driven template engine.
**Fix**: 
1. Add a `DocumentTemplate` model to `schema.prisma`.
2. Add a "Save as Template" button to the Document Drafter toolbar that opens a modal to capture the template's Name and Description.
3. Create a Next.js Server Action (`POST /api/templates`) that saves the current `editorJSON` to the database.

### Bug 4: AI Assistant Failure
**Root Cause**: The TipTap `AiSuggestion` extension (`lib/editor/AiSuggestion.ts`) is misconfigured. It defines `content: 'inline*'` (meaning it expects to wrap inline content), but its associated React component (`AiSuggestionView.tsx`) does not render the required `<NodeViewContent />` TipTap container. When the `insertAiSuggestion` command is fired after the AI finishes streaming, TipTap silently aborts the transaction because it cannot mount a content-bearing NodeView without a content container. 
**Fix**: Change the `AiSuggestion` extension configuration by removing `content: 'inline*'` or setting it to a leaf node structure, since the view only renders the `text` attribute directly.

---

## Part 2: Architecture Verification

**Authentication Provider**: Verified. The codebase utilizes **Supabase** (as confirmed by `@supabase/supabase-js` in `package.json` and the client initialization in `lib/supabase/client.ts`).
**Database Layer**: Verified. **Prisma** is actively used with a robust schema mapping to Supabase PostgreSQL.

---

## Part 3: Phased Execution Plan

### Phase 1: Immediate Bug Fixes & Template Engine (Current Focus)
- [ ] **Fix Resizer**: Update `react-resizable-panels` imports and components in `page.tsx`.
- [ ] **Fix AI NodeView**: Correct the `AiSuggestion` schema configuration in TipTap.
- [ ] **Align Template IDs**: Fix the mapping between the Gallery and `templateContents.ts`.
- [ ] **Generate Real Boilerplate**: Replace the placeholder text in `templateContents.ts` with comprehensive JSON boilerplate for an MSA and NDA.
- [ ] **Custom Templates**: Update `schema.prisma` with a `DocumentTemplate` model and wire up the "Save as Template" UI.

### Phase 2: Enterprise Features (Scale)
- [ ] **Security & RBAC**: Update `schema.prisma` to add a `Role` enum to the `User` model. Implement Next.js `middleware.ts` to decode Supabase JWTs and protect routes based on role.
- [ ] **Document Management System (DMS)**: Build the `FileExplorer` UI to navigate the existing `DocumentFolder` recursive structure. Integrate `mammoth.js` via a server action to import `.docx` files into TipTap JSON.
- [ ] **Real-Time Collaboration**: Stand up a Node.js WebSocket server (`@hocuspocus/server`) and integrate `yjs` + `@tiptap/extension-collaboration` into the frontend editor for multiplayer redlining.
- [ ] **Secure Client Portal**: Create the `DocumentShare` Prisma model and build the detached `/portal/[token]` Next.js route for external client viewing and e-signatures.
