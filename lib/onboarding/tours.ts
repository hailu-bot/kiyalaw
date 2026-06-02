import type { Step } from 'react-joyride';

export const TOURS: Record<string, Step[]> = {
  '/': [
    { target: 'body', content: 'Welcome to Kiya Law! This quick tour will show you the key areas of your dashboard.', placement: 'center' },
    { target: 'a[href="/matters"]', content: 'Active Matters — click to view all your legal matters and their statuses.', placement: 'bottom' },
    { target: 'a[href="/billing/approvals"]', content: 'Draft Invoices Awaiting Approval — see invoices that need your review.', placement: 'bottom' },
    { target: 'a[href="/billing"]', content: 'Outstanding Receivables — track unpaid invoices and revenue.', placement: 'bottom' },
    { target: '.draft-queue-section', content: 'Draft Queue — approve, reject, or manage draft invoices from here.', placement: 'top' },
  ],
  '/matters': [
    { target: 'body', content: 'Matters are the core of your legal practice. Each matter tracks a case or project for a client.', placement: 'center' },
    { target: 'a[href="/matters/new"]', content: 'Click "New Matter" to create a new legal matter.', placement: 'bottom' },
    { target: 'table', content: 'This table lists all your matters. Click any row to view details, add activities, or manage time entries.', placement: 'top' },
  ],
  '/clients': [
    { target: 'body', content: 'Manage your client directory here. Each client can have multiple matters, documents, and invoices.', placement: 'center' },
    { target: 'button', content: 'Click "New Client" to add a client with their contact info, billing terms, and more.', placement: 'bottom' },
    { target: '[class*="grid"]', content: 'Browse your client list. Click a client card to view their full profile and related matters.', placement: 'top' },
  ],
  '/billing': [
    { target: 'body', content: 'Track all invoices, monitor payment status, and manage your billing workflow.', placement: 'center' },
    { target: 'a[href="/billing/new"]', content: 'Create a new invoice linked to a matter with line items and amounts.', placement: 'bottom' },
    { target: 'a[href="/billing/approvals"]', content: 'View the approval queue to approve or reject draft invoices.', placement: 'bottom' },
  ],
  '/time': [
    { target: 'body', content: 'Log your billable and non-billable hours here. Accurate time tracking is essential for billing.', placement: 'center' },
    { target: '[class*="QuickTimeEntryForm"]', content: 'Quick-log time entries with matter, description, hours, and date.', placement: 'right' },
    { target: 'input[name="search"]', content: 'Search and filter your time entries by keyword, matter, or date range.', placement: 'bottom' },
  ],
  '/time/ai-logger': [
    { target: 'body', content: 'Use AI to log time entries by describing your work in plain English.', placement: 'center' },
    { target: 'textarea', content: 'Type what you worked on (e.g., "Reviewed contract for 2 hours for NovaTech"), and AI will structure it.', placement: 'top' },
  ],
  '/documents': [
    { target: 'body', content: 'The Document Management System lets you create, edit, and organize legal documents.', placement: 'center' },
    { target: '[class*="DMSSidebar"]', content: 'Browse folders and documents. Use the sidebar to navigate your file structure.', placement: 'right' },
    { target: 'button', content: 'Create new documents, upload files, or use templates to speed up drafting.', placement: 'bottom' },
  ],
  '/settings': [
    { target: 'body', content: 'Configure your firm profile, automation rules, and account settings.', placement: 'center' },
    { target: '[class*="TabFirmProfile"]', content: 'Set your firm name, default billing rate, timezone, and branding.', placement: 'bottom' },
    { target: '[class*="TabUserAccount"]', content: 'Manage your account details, role, and security settings.', placement: 'bottom' },
  ],
};

export const TOUR_LOCALE = {
  back: 'Back',
  close: 'Close',
  last: 'Done',
  next: 'Next',
  skip: 'Skip Tour',
};
