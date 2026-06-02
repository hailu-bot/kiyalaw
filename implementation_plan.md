# Implementation Plan: Stitch → Modular Next.js Migration

> **Status:** PLAN MODE — Review before executing any file writes.
>
> Run `npm run build && npm run lint` after every major group of changes.

---

## Phase 0: Inventory & Structural Protection

### Protected Routes (DO NOT TOUCH)
| Route | Reason |
|---|---|
| `app/(dashboard)/matters/**` | Fully DB-wired via Prisma server actions |
| `app/(dashboard)/billing/**` | Fully DB-wired via Prisma |
| `app/(dashboard)/clients/**` | Loads from Prisma `matter.groupBy` |
| `app/(dashboard)/time/**` | DB-wired (Prisma activities + server action) |
| `app/(dashboard)/automation/**` | Working route, no stitch upgrade needed |

### Partially Protected Route
| Route | Constraint |
|---|---|
| `app/(dashboard)/documents/**` | Preserve existing `DocumentDrafter` + `A4Preview` layout; may add missing code blocks (template gallery, selection modals) |

### Stitch Source Directory
`stitch_kiya_law_billing_platform/` — 45 subfolders (48 entries total, 3 are asset-only portrait folders).

A duplicate nested directory `stitch_kiya_law_billing_platform/stitch_kiya_law_billing_platform/` contains 37 of the same screens + 1 unique (`new_time_entry`).

---

## Phase 1: Document Route Expansion (Incomplete Route)

**Goal:** Add missing document screens while preserving existing `DocumentDrafterPage` layout.

### New Files to Create

```
components/document/
├── DocumentTemplateGallery.tsx    # Gallery grid from stitch (document_template_gallery_1, document_template_gallery_2)
├── DocumentTypeSelectionModal.tsx  # Modal overlay for doc type selection
├── MemoTemplateSelection.tsx       # Memo-specific template selection
├── ContractTemplatesGallery.tsx    # Contract-specific gallery
├── SelectPleadingTemplate.tsx      # Pleading template gallery
├── PleadingTemplateDetails.tsx     # Detail view of single template
├── MotionForSummaryJudgmentGallery.tsx  # MSJ curated gallery
├── MSJTemplateEditor.tsx           # Full three-column template editor
└── AIDocumentEnhancements.tsx      # AI enhancement overlay modal
```

### Route to Add/Modify
```
app/(dashboard)/documents/
├── page.tsx                     # Keep existing (DocumentDrafter + A4Preview)
├── templates/
│   └── page.tsx                 # Template gallery hub
├── templates/[templateId]/
│   └── page.tsx                 # Template detail page
└── templates/msj/
    ├── page.tsx                 # MSJ gallery
    └── [msjId]/edit/
        └── page.tsx             # MSJ template editor
```

### Links to Add in Existing `documents/page.tsx`
- Add a "Templates" button in the toolbar that navigates to `/documents/templates`
- Wire "Use This Template" buttons as `<Link>` to `templates/[templateId]`

---

## Phase 2: Time Entry Enhancement (Already Wired)

**Goal:** Add missing secondary screens from stitch to the existing `/time` route.

### New Components
```
components/time/
├── TimeEntryDetail.tsx            # Read-only detail view (time_entry_details)
├── TimeEntryDetailReview.tsx      # Review-and-confirm screen
├── NewTimeEntryManual.tsx         # Manual time entry form (new_time_entry_1, new_time_entry_2)
├── AITimeEntrySuggestions.tsx     # AI suggestion modal overlay
├── AITimeEntryRefinement.tsx      # Single-entry refinement modal
├── DailyTimeLogBreakdown.tsx      # Daily/weekly log summary
└── EditTimeEntryModal.tsx         # Edit existing entry modal
```

### Route Changes
```
app/(dashboard)/time/
├── page.tsx                     # Keep existing AI Time Logger (already DB-wired)
├── new/
│   └── page.tsx                 # Manual time entry (NewTimeEntryManual)
├── entries/[entryId]/
│   └── page.tsx                 # Detail review view
└── daily/
    └── page.tsx                 # Daily time log breakdown
```

### Links to Add
- `/time` page → Add "Manual Entry" link to `/time/new`
- `/time/new` → After save, redirect to `/time/entries/[id]`
- `/time/entries/[id]` → "Edit" button opens `EditTimeEntryModal`
- `/time` → Link to `/time/daily` for log breakdown

---

## Phase 3: AI Matter View (New Route)

**Goal:** Create a dedicated AI-powered matter intelligence view integrating AI time logger suggestions, document enhancement, and matter analytics.

### No dedicated stitch folder exists — compose from:
- `ai_time_logger` (AI-powered interface pattern)
- `ai_time_entry_suggestions` (suggestion cards)
- `ai_document_enhancements_overlay` (AI document features)
- `automation_hub` (workflow/automation cards)
- `matter_activity_log` (matter summary widget)
- `command_center_dashboard` (metric stat cards pattern)

### New Files
```
app/(dashboard)/ai-matter/
└── page.tsx                     # AI Matter dashboard view

components/matter/
├── AIMatterDashboard.tsx        # Main AI Matter view (metrics + AI suggestion feed + matter list)
├── AIMatterSuggestionCard.tsx   # Individual AI suggestion with approve/edit/dismiss
├── AIMatterAnalyticsWidget.tsx  # Billable hours, upcoming deadlines, risk flags
└── AIActivitySummary.tsx        # AI-summarized activity feed
```

### Sidebar Update (`components/layout/Sidebar.tsx`)
Add after the "AI Automation" item:
```tsx
<SidebarNavItem icon={Bot} label="AI Matter" href="/ai-matter" isCollapsed={sidebarCollapsed} isActive={pathname.startsWith('/ai-matter')} />
```

### Sidebar Icon
Import `Bot` from `lucide-react` (already imported in Sidebar.tsx on line 5).

---

## Phase 4: Automation Route Expansion

**Goal:** Add missing automation screens from stitch while preserving existing Automation Hub.

### New Components
```
components/automation/
├── AutomationSettings.tsx        # Settings/config panel
└── AutomationWorkflowCard.tsx    # Individual workflow card component
```

### Route Changes
```
app/(dashboard)/automation/
├── page.tsx                     # Keep existing Automation Hub
└── settings/
    └── page.tsx                 # Automation settings page
```

---

## Phase 5: Dashboard Enhancements (Optional Polish)

**Goal:** Enhance existing dashboard (`app/page.tsx`) with elements from `command_center_dashboard` stitch.

No new components needed — the existing dashboard already mirrors the stitch. Consider adding:
- "View All" links on draft queue items linking to `/billing/approvals`
- Activity feed items linking to respective matter detail pages

---

## Phase 6: Routing Interconnections

### Link Inventory (Cross-View Navigation)

| From | To | Component/Location |
|---|---|---|
| Dashboard draft queue item | `/billing/[invoiceId]` | `app/page.tsx` |
| Dashboard activity feed item | `/matters/[matterId]` | `app/page.tsx` |
| Matter detail page "New Activity" | `/matters/[matterId]/new-activity` | `app/(dashboard)/matters/[matterId]/page.tsx:69` |
| Matter list card | `/matters/[matterId]` | `app/(dashboard)/matters/page.tsx:98` |
| Billing "Create Invoice" | `/billing/new` | `app/(dashboard)/billing/page.tsx:24` |
| Invoice detail "Edit" | `/billing/[invoiceId]/edit` | `app/(dashboard)/billing/[invoiceId]/page.tsx` |
| Billing "Approvals" | `/billing/approvals` | sidebar or top nav |
| AI Matter suggestion → Matter | `/matters/[matterId]` | `AIMatterSuggestionCard.tsx` |
| AI Matter suggestion → Time | `/time` | `AIMatterSuggestionCard.tsx` |
| Documents "Templates" | `/documents/templates` | `documents/page.tsx` toolbar |
| Template gallery → Detail | `/documents/templates/[templateId]` | template card link |
| Template detail → "Use This" | `/documents` (with template loaded) | `PleadingTemplateDetails.tsx` |
| Time → Manual entry | `/time/new` | `time/page.tsx` add button |
| Time → Entry detail | `/time/entries/[entryId]` | entry row link |
| Automation → Settings | `/automation/settings` | `automation/page.tsx` add link |

All links use Next.js `<Link>` from `next/link`.

---

## Phase 7: Execution Order

```
Phase 1: Document route expansion
    ↓ verify: npm run build && npm run lint
Phase 2: Time entry enhancement
    ↓ verify: npm run build && npm run lint
Phase 3: AI Matter view + Sidebar update
    ↓ verify: npm run build && npm run lint
Phase 4: Automation settings
    ↓ verify: npm run build && npm run lint
Phase 5-6: Dashboard polish + cross-view linking
    ↓ verify: npm run build && npm run lint
```

---

## File Tree: Final Target State

```
app/(dashboard)/
├── ai-matter/
│   └── page.tsx                     # NEW
├── automation/
│   ├── page.tsx                     # existing (keep)
│   └── settings/
│       └── page.tsx                 # NEW
├── billing/                         # PROTECTED — no changes
├── clients/                         # PROTECTED — no changes
├── documents/
│   ├── page.tsx                     # existing (add template link)
│   └── templates/
│       ├── page.tsx                 # NEW template hub
│       ├── [templateId]/
│       │   └── page.tsx             # NEW detail
│       └── msj/
│           ├── page.tsx             # NEW gallery
│           └── [msjId]/edit/
│               └── page.tsx         # NEW editor
├── matters/                         # PROTECTED — no changes
└── time/
    ├── page.tsx                     # existing (add links)
    ├── new/
    │   └── page.tsx                 # NEW manual entry
    ├── entries/
    │   └── [entryId]/
    │       └── page.tsx             # NEW detail/review
    └── daily/
        └── page.tsx                 # NEW log breakdown

components/
├── matter/
│   ├── AIMatterDashboard.tsx        # NEW
│   ├── AIMatterSuggestionCard.tsx   # NEW
│   ├── AIMatterAnalyticsWidget.tsx  # NEW
│   └── AIActivitySummary.tsx        # NEW
├── document/
│   ├── DocumentTemplateGallery.tsx  # NEW
│   ├── DocumentTypeSelectionModal.tsx # NEW
│   ├── MemoTemplateSelection.tsx    # NEW
│   ├── ContractTemplatesGallery.tsx # NEW
│   ├── SelectPleadingTemplate.tsx   # NEW
│   ├── PleadingTemplateDetails.tsx  # NEW
│   ├── MotionForSummaryJudgmentGallery.tsx # NEW
│   ├── MSJTemplateEditor.tsx        # NEW
│   └── AIDocumentEnhancements.tsx   # NEW
├── time/
│   ├── TimeEntryDetail.tsx          # NEW
│   ├── TimeEntryDetailReview.tsx    # NEW
│   ├── NewTimeEntryManual.tsx       # NEW
│   ├── AITimeEntrySuggestions.tsx   # NEW
│   ├── AITimeEntryRefinement.tsx    # NEW
│   ├── DailyTimeLogBreakdown.tsx    # NEW
│   └── EditTimeEntryModal.tsx       # NEW
├── automation/
│   ├── AutomationSettings.tsx       # NEW
│   └── AutomationWorkflowCard.tsx   # NEW
├── layout/
│   ├── Sidebar.tsx                  # EDIT (add AI Matter nav link)
│   ├── AppLayout.tsx                # existing (keep)
│   └── TopNav.tsx                   # existing (keep)
├── client/                          # existing (keep)
├── invoice/                         # existing (keep)
└── ui/                              # existing (keep)
```

---

## Design Tokens Reference (Tailwind v4 via `@config`)

Use custom tokens from `tailwind.config.ts` — NOT standard Tailwind font/size utilities:
- `font-headline-md` / `font-headline-sm` (Playfair Display)
- `font-body-md` (Inter)
- `font-label-md` / `font-label-sm` (Inter)
- Colors: `bg-[#0A1128]`, `text-[#D4AF37]`, `border-[#D4AF37]`
- Spacing: `px-margin-mobile`, `px-margin-desktop`, `max-w-container-max`, `gap-gutter`

Do NOT use `rounded-*` utility classes — design requires `rounded-none` (sharp corners).

---

## Key Stitch HTML → Component Mapping Reference

| Stitch Folder | Component(s) | Phase |
|---|---|---|
| `command_center_dashboard` | Already exists as `app/page.tsx` | — |
| `ai_time_logger` | `app/(dashboard)/time/page.tsx` (exists) | — |
| `new_time_entry_1`, `new_time_entry_2`, `new_time_entry` (nested) | `NewTimeEntryManual` | 2 |
| `ai_time_entry_suggestions` | `AITimeEntrySuggestions` | 2 |
| `ai_time_entry_refinement_overlay` | `AITimeEntryRefinement` | 2 |
| `edit_time_entry_modal` | `EditTimeEntryModal` | 2 |
| `time_entry_details` | `TimeEntryDetail` | 2 |
| `time_entry_detail_review` | `TimeEntryDetailReview` | 2 |
| `daily_time_log_breakdown` | `DailyTimeLogBreakdown` | 2 |
| `document_template_gallery_1`, `document_template_gallery_2` | `DocumentTemplateGallery` | 1 |
| `document_type_selection_modal` | `DocumentTypeSelectionModal` | 1 |
| `select_pleading_template` | `SelectPleadingTemplate` | 1 |
| `pleading_template_details` | `PleadingTemplateDetails` | 1 |
| `memo_template_selection` | `MemoTemplateSelection` | 1 |
| `contract_templates_gallery` | `ContractTemplatesGallery` | 1 |
| `motion_for_summary_judgment_gallery` | `MotionForSummaryJudgmentGallery` | 1 |
| `motion_for_summary_judgment_template_editor` | `MSJTemplateEditor` | 1 |
| `intelligent_document_drafter` | Already partially exists as `DocumentDrafter` | — |
| `enhanced_document_drafter` | Referenced by existing `DocumentDrafter` | — |
| `ai_document_enhancements_overlay` | `AIDocumentEnhancements` | 1 |
| `template_builder_workflow` | Stretch goal — complex workflow component | 1+ |
| `matter_management` | `app/(dashboard)/matters/page.tsx` (exists) | — |
| `matter_activity_log` | `app/(dashboard)/matters/[matterId]/page.tsx` (exists) | — |
| `stark_industries_matter_list` | `app/(dashboard)/clients/[clientId]/page.tsx` (exists) | — |
| `client_directory` | `app/(dashboard)/clients/page.tsx` (exists) | — |
| `select_client_modal` | `SelectClientModal` (exists) | — |
| `create_new_matter_form` | `NewMatterForm` (exists) | — |
| `log_matter_activity` | `MatterActivityForm` (exists) | — |
| `log_document_activity` | `MatterActivityForm` (type='document') (exists) | — |
| `create_new_invoice_1`, `create_new_invoice_2` | `CreateInvoiceForm` (exists) | — |
| `edit_invoice_details_1`, `edit_invoice_details_2` | `EditInvoiceForm` (exists) | — |
| `draft_invoice_detail` | `InvoiceDetail` (exists) | — |
| `draft_invoice_details` | `InvoiceDetail` (exists) | — |
| `invoice_approval_queue` | `InvoiceApprovalQueue` (exists) | — |
| `invoice_confirmation` | `app/(dashboard)/billing/new` success redirect (exists) | — |
| `billing_history_status` | `app/(dashboard)/billing/page.tsx` (exists) | — |
| `automation_hub` | `app/(dashboard)/automation/page.tsx` (exists) | — |
| `automation_settings` | `AutomationSettings` | 4 |
| (composite: ai + matter features) | `AIMatterDashboard`, etc. | 3 |

---

## Review Checklist

Before approving execution, verify:

- [ ] No existing DB-wired route (`matters`, `billing`, `clients`, `time`) is modified
- [ ] `documents/page.tsx` layout preserved (only add links, not restructure)
- [ ] AI Matter nav link added only to sidebar, no route collisions
- [ ] All new components use `rounded-none` (no border-radius)
- [ ] All new components use custom font tokens (`font-headline-md`, etc.)
- [ ] All new routes properly `await` `params` Promise
- [ ] Cross-view `<Link>` wiring is complete
- [ ] `npm run build && npm run lint` passes after each phase
