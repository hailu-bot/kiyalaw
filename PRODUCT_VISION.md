# Kiya Law — Product Vision & Roadmap

## 1. Executive Summary
Kiya Law is an enterprise-grade Legal Software-as-a-Service (SaaS) platform designed to operate as a central "Command Center" for law firms and corporate counsel. It unifies Practice Management (Clients/Matters), Document Drafting, Time Tracking, Billing, and Artificial Intelligence (Juris AI) into a single, seamless, high-performance web application.

## 2. Core Modules & End-State Functionality

### A. Advanced Document Drafter & DMS
**The Goal:** Replace Microsoft Word and Google Docs for legal professionals by providing a native, legally-formatted drafting environment.
* **WYSIWYG A4 Canvas:** A flawless, paginated A4 editing experience powered by self-hosted TinyMCE v8. It must support precise margins, legal typography, and print-ready outputs.
* **Corporate Letterheads & Footers:** Automated, immutable letterheads and pagination that output perfectly to PDF without disrupting the digital typing experience.
* **Template Engine:** A library of reusable legal templates (e.g., Case Briefs, Invoices, Motions) that auto-populate with Client and Matter data.
* **Digital Stamping & Export:** The ability to drag-and-drop digital notary/approval stamps and seamlessly export to PDF or DOCX.

### B. Juris AI Assistant
**The Goal:** An embedded, context-aware AI paralegal that assists directly within the user's workflow.
* **Drafting & Enhancing:** Contextual AI tools to instantly "Formalize Tone," "Simplify," "Check Compliance," or draft specific legal clauses directly into the TinyMCE canvas.
* **Floating AI Chat:** A side-panel Juris AI assistant capable of analyzing the current document, referencing local laws, and suggesting edits without losing the user's context.

### C. Practice & Matter Management
**The Goal:** A single source of truth for all casework.
* **Entity Relationships:** Strict database tracking linking Clients to specific Matters, tracking every Activity, Document, and Time Entry associated with that case.
* **Status Tracking:** Real-time visibility into whether a Matter is Active, Pending, or Closed.

### D. Time Tracking & Billing Pipeline
**The Goal:** Eliminate revenue leakage by creating a frictionless path from a logged hour to a paid invoice.
* **Time Logger:** Quick-capture time entries linked to specific Matters and users.
* **Invoice Generation:** Automated conversion of logged time and fixed fees into beautifully formatted legal invoices.
* **Approval Workflows:** Status-driven pipeline (Draft -> Pending Approval -> Finalized -> Paid).

## 3. UI/UX Design Philosophy
* **Enterprise Stability over Flash:** The layout must be strictly structured using standard Flexbox grids. No unpredictable overlapping elements, hidden click-traps, or vanishing sidebars.
* **Contextual Tooling:** Toolbars and options should only appear when relevant (e.g., the text formatting toolbar only shows when in the Document Drafter).
* **Speed & Reliability:** The UI must feel as instant as a desktop application, leveraging Next.js caching and Zustand local state to prevent loading spinners wherever possible.