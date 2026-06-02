export type ID = string;

export type BusinessType = 'LLC' | 'Corporation' | 'Partnership' | 'SoleProprietorship' | 'NonProfit' | 'Other';

export type BillingTerms = 'Net15' | 'Net30' | 'Net45' | 'Net60' | 'Net90' | 'DueOnReceipt';

export type DocumentLabel =
  | 'CertificateOfIncorporation'
  | 'TaxDocument'
  | 'BusinessLicense'
  | 'Identification'
  | 'Contract'
  | 'CourtFiling'
  | 'FinancialStatement'
  | 'InsuranceCertificate'
  | 'ComplianceDocument'
  | 'Other';

export type MatterStatus = 'Active' | 'Pending' | 'Closed';

export type ActivityType = 'time' | 'document' | 'communication';

export type InvoiceStatus =
  | 'Draft'
  | 'PendingApproval'
  | 'Approved'
  | 'Finalized'
  | 'Paid';

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface ClientDocument {
  id: ID;
  clientId: ID;
  fileName: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  label: DocumentLabel;
  fileUrl: string;
  metadata?: Record<string, unknown>;
  uploadedAt: string;
}

export interface Matter {
  id: ID;
  matterCode: string;
  title: string;
  clientName: string;
  clientId?: string;
  practiceArea: string;
  status: MatterStatus;
  billableTargetHours?: number;
  leadAttorneyName?: string;
  createdAt: string;
}

export interface Activity {
  id: ID;
  matterId: ID;
  type: ActivityType;
  description: string;
  createdAt: string;
}

export interface Invoice {
  id: ID;
  invoiceNumber: string;
  matterId: ID;
  clientName: string;
  amount: number;
  dueDateLabel: string;
  status: InvoiceStatus;
  createdAt: string;
  approvedAt?: string | null;
}

export interface InvoiceApproval {
  id: ID;
  invoiceId: ID;
  approverName: string;
  decision: 'Approved' | 'Rejected';
  note?: string;
  createdAt: string;
}

export interface AutomationRule {
  id: ID;
  name: string;
  enabled: boolean;
  trigger: {
    type: 'invoice_status_changed';
    from?: InvoiceStatus;
    to?: InvoiceStatus;
  };
  action: {
    type: 'create_task' | 'send_email' | 'update_status' | 'post_slack';
    // keeping generic for now
    payload?: Record<string, unknown>;
  };
  createdAt: string;
}

