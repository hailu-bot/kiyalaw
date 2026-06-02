// Navigation items and status colors

export const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: 'LayoutDashboard' },
  { href: '/matters', label: 'Matters', icon: 'Briefcase' },
  { href: '/time', label: 'Time Logger', icon: 'Clock' },
  { href: '/billing', label: 'Billing', icon: 'ClipboardList' },
  { href: '/clients', label: 'Clients', icon: 'Users' },
  { href: '/documents', label: 'Documents', icon: 'FileText' },
  { href: '/automation', label: 'Automation', icon: 'Settings' },
];

export const STATUS_COLORS: Record<string, string> = {
  Draft: 'bg-surface-tint text-surface-tint',
  PendingApproval: 'bg-warning text-on-warning',
  Approved: 'bg-success text-on-success',
  Finalized: 'bg-primary-container text-on-primary',
  Paid: 'bg-success text-on-success',
  Active: 'bg-success text-on-success',
  Prospect: 'bg-warning text-on-warning',
  Inactive: 'bg-surface-tint text-surface-tint',
  Closed: 'bg-error text-on-error',
};

// A4 page content area height at 96 DPI (printable area)
export const PAGE_CONTENT_HEIGHT = 1056;

// Parse a page range string like "1,3,5-7" into a set of 0-indexed page numbers
export function parsePageRanges(input: string, totalPages: number): Set<number> {
  const pages = new Set<number>();
  if (!input.trim()) return pages;
  const parts = input.split(",");
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const rangeMatch = trimmed.match(/^(\d+)\s*-\s*(\d+)$/);
    if (rangeMatch) {
      const start = Math.max(1, parseInt(rangeMatch[1], 10));
      const end = Math.min(totalPages, parseInt(rangeMatch[2], 10));
      for (let p = start; p <= end; p++) pages.add(p - 1);
    } else {
      const num = parseInt(trimmed, 10);
      if (!isNaN(num) && num >= 1 && num <= totalPages) pages.add(num - 1);
    }
  }
  return pages;
}

export const BUSINESS_TYPES = [
  { value: 'LLC', label: 'LLC' },
  { value: 'Corporation', label: 'Corporation' },
  { value: 'Partnership', label: 'Partnership' },
  { value: 'SoleProprietorship', label: 'Sole Proprietorship' },
  { value: 'NonProfit', label: 'Non-Profit' },
  { value: 'Other', label: 'Other' },
] as const;

export const BILLING_TERMS = [
  { value: 'Net15', label: 'Net 15' },
  { value: 'Net30', label: 'Net 30' },
  { value: 'Net45', label: 'Net 45' },
  { value: 'Net60', label: 'Net 60' },
  { value: 'Net90', label: 'Net 90' },
  { value: 'DueOnReceipt', label: 'Due on Receipt' },
] as const;

export const DOCUMENT_LABELS = [
  { value: 'CertificateOfIncorporation', label: 'Certificate of Incorporation' },
  { value: 'TaxDocument', label: 'Tax Document' },
  { value: 'BusinessLicense', label: 'Business License' },
  { value: 'Identification', label: 'Identification' },
  { value: 'Contract', label: 'Contract' },
  { value: 'CourtFiling', label: 'Court Filing' },
  { value: 'FinancialStatement', label: 'Financial Statement' },
  { value: 'InsuranceCertificate', label: 'Insurance Certificate' },
  { value: 'ComplianceDocument', label: 'Compliance Document' },
  { value: 'Other', label: 'Other' },
] as const;

