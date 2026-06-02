<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Kiya Law — Agent Instructions

## Stack
- **Next.js 16.2.6** + React 19, Tailwind v4 (`@import "tailwindcss"` + `@config "../tailwind.config.ts"`)
- Path alias `@/*` maps to **root**, not `src/`
- **Prisma** + **Supabase** dual data layer — prefer Prisma for server components & actions (singleton: `lib/prisma/client.ts`)
- **Zustand** store (`lib/store/useUIStore.ts`) for sidebar collapse & topNav content
- `lucide-react` icons

## Design System
- Deep Navy `#0A1128` (bg), Champagne Gold `#D4AF37` (accent)
- Fonts: Playfair Display (headlines: `font-headline-md`, `font-headline-sm`), Inter (body: `font-body-md`, labels)
- `rounded-none` for sharp boundaries; no border-radius by default
- Custom Tailwind tokens in `tailwind.config.ts` (spacing: `gutter`, `margin-mobile`, etc.)

## Commands
```
npm run dev     # dev server
npm run build   # build (must pass)
npm run lint    # eslint
```

## Key Architecture
- Routes in top-level `app/` with `(dashboard)` layout group wrapping Sidebar + TopNav
- Layout: `app/layout.tsx` → `components/layout/AppLayout.tsx` (flex row: Sidebar + main area)
- Sidebar: `components/layout/Sidebar.tsx` — manual nav item list, update here for new routes
- Server actions in `app/actions/` and `app/lib/actions/`
- Components in `components/{matter,invoice,client,document,time,layout,ui}/`

## Stitch Fragments
- Prototype HTML screens in `stitch_kiya_law_billing_platform/` — 45 subfolders, each with `code.html` + `screen.png`
- Do NOT overwrite operational DB-wired routes (`matters`, `billing`, `clients`, `time`)
- `documents/` route is incomplete — add code blocks but preserve existing layout

## Guardrails
- Run `npm run build && npm run lint` after any changes
- No commit unless explicitly asked
- Server `params` is `Promise<{ id: string }>` — must `await`
- Custom font tokens: `font-headline-md`, `font-label-md`, etc. — do not use standard Tailwind font utilities
