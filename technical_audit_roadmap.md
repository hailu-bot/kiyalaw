# Principal Architect Codebase Audit & Roadmap

## Executive Summary
After a comprehensive inspection of the Kiya Law workspace, the codebase reflects a modern, performant foundation utilizing Next.js 16.2.6 (React 19), Tailwind CSS v4, Prisma, and Supabase. The dual data layer (Prisma for server components, Supabase for authentication/real-time) is robust, and the UI layout structure successfully isolates the dashboard application. However, to evolve into an enterprise-grade Legal Tech SaaS platform, significant architectural enhancements are necessary. Specifically, while the `Document` and `DocumentFolder` Prisma models establish a basic structure for file storage, the platform lacks real-time multiplayer editing, strict role-based access control (RBAC), and external client collaboration capabilities. 

## Identified Architectural Gaps
1. **Real-Time Synchronization**: TipTap is installed but lacks the required extensions and WebSocket backend (like Hocuspocus or Yjs) to support multiplayer editing or concurrent tracking of cursor locations.
2. **Access Control (RBAC)**: The Prisma `User` schema currently lacks a `role` field. There is no middleware or database-level policy enforcing strict permissions across routes (Partner vs. Paralegal).
3. **Client Portal & Magic Links**: The current architecture is strictly staff-facing. There is no isolated, secure route or tokenization system allowing external clients to interact with documents without full user accounts.
4. **Third-Party Integration**: While `mammoth` is installed for parsing `.docx` files, there is no defined pipeline for continuous sync or export to Google Drive or Microsoft 365, which is crucial for legal workflows.
5. **Redlining & Track Changes**: TipTap is not configured for MS Word-style track changes, a non-negotiable feature for legal contract negotiation.

## Proposed Enterprise Features

### 1. Real-Time Collaboration & Redlining
**Technical Plan**:
- **State & Sync**: Integrate `yjs` as the CRDT (Conflict-free Replicated Data Type) engine and use a Node.js WebSocket server (e.g., `@hocuspocus/server`) to sync document state between clients.
- **TipTap Extensions**: Install `@tiptap/extension-collaboration` and `@tiptap/extension-collaboration-cursor` to render multiplayer cursors.
- **Redlining**: Implement an extension for Track Changes (e.g., wrapping TipTap marks to record `authorId`, `timestamp`, and `action: added | deleted`).
- **NPM Packages**: `yjs`, `y-webrtc`, `@hocuspocus/provider`, `@tiptap/extension-collaboration`

### 2. Role-Based Access Control (RBAC)
**Technical Plan**:
- **Prisma Schema Update**: Add a `Role` enum to the `User` model containing `PARTNER`, `ASSOCIATE`, `PARALEGAL`, and `CLIENT`.
- **Middleware**: Implement a Next.js `middleware.ts` to intercept requests, read the user's JWT from Supabase cookies, and restrict access based on role.
- **UI Guardrails**: Create a `<RoleBoundary allowedRoles={['PARTNER']}>` wrapper component to selectively render UI elements like the "Approve Invoice" button.

### 3. Document Management System (DMS)
**Technical Plan**:
- **Database Architecture**: The `DocumentFolder` schema (with `parentId`) is well-designed. We will implement a materialized path or use the existing recursive query structure to fetch folder trees.
- **UI Strategy**: Build a `FileExplorer` component using `react-resizable-panels` (already in `package.json`) to create a dual-pane layout: a tree view on the left and folder contents on the right. Add drag-and-drop using `@dnd-kit/core`.

### 4. Import/Export Pipeline
**Technical Plan**:
- **Import (.docx)**: Use the installed `mammoth.js` package within a Next.js Server Action to parse uploaded `.docx` files into HTML strings, and initialize TipTap/Yjs documents from the HTML.
- **Export**: Use `react-to-print` (already installed) or a headless browser (Puppeteer) server-side to generate final PDFs.
- **Google Drive Integration**: Add `googleapis` to authenticate with user Google accounts via OAuth2, mapping internal folders to Drive directories for bidirectional sync.

### 5. Secure Client Portal
**Technical Plan**:
- **Tokenization**: Create a `DocumentShare` Prisma model that links a `documentId` to a unique, hashed `token`, `expiresAt` date, and `permissions` (e.g., `VIEW`, `COMMENT`, `SIGN`).
- **Routing**: Build an isolated route `app/portal/[token]/page.tsx` that bypasses the standard dashboard layout.
- **E-Signature**: Integrate a lightweight canvas or drawing library for e-signatures, appending the signature image and an audit log directly to the `DocumentVersion`.

## Actionable Next Steps

### Phase 1: Foundation & Security
- [ ] Update `schema.prisma` with `Role` enum and `DocumentShare` models.
- [ ] Implement `middleware.ts` to enforce RBAC using Supabase auth tokens.
- [ ] Create a `lib/rbac.ts` utility for server-side role validation.

### Phase 2: Document Management (DMS)
- [ ] Develop the `FileExplorer` tree component to navigate `DocumentFolder` records.
- [ ] Implement drag-and-drop file organization and breadcrumb navigation.
- [ ] Create a Next.js Server Action for importing `.docx` via `mammoth.js`.

### Phase 3: Real-Time & Collaboration
- [ ] Stand up a local Hocuspocus WebSocket server.
- [ ] Install Yjs and TiapTap collaboration extensions.
- [ ] Refactor the Document Editor component to connect to the Yjs provider.

### Phase 4: Client Portal
- [ ] Build the `app/portal/[token]` route.
- [ ] Implement the secure read-only/commenting view for clients.
- [ ] Add basic E-signature canvas functionality.

---
*Please review this roadmap. Once approved, we can begin executing the actionable next steps sequentially.*
