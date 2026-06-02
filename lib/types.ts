// Common types used throughout the application

export interface TimeEntry {
  id: string;
  description: string;
  client: string;
  matter: string;
  hours: number;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  client: string;
  matter: string;
  amount: number;
  dueDate: string;
  dateCreated: string;
  status: 'Draft' | 'Pending' | 'Approved' | 'Paid';
  lineItems: LineItem[];
}

export interface LineItem {
  id: string;
  description: string;
  amount: number;
  quantity: number;
  rate: number;
}

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

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface ClientDocument {
  id: string;
  clientId: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  label: DocumentLabel;
  fileUrl: string;
  metadata?: Record<string, unknown>;
  uploadedAt: string;
}

export interface Client {
  id: string;
  name: string;
  contactName: string;
  contactTitle: string;
  email: string;
  phone: string;
  industry: string;
  status: 'Active' | 'Inactive' | 'Prospect';
  notes: string;
  avatarUrl?: string;
  registrationNumber?: string;
  taxId?: string;
  vatNumber?: string;
  businessType?: BusinessType;
  dateOfIncorporation?: string;
  jurisdiction?: string;
  registeredAddress?: Address;
  billingAddress?: Address;
  website?: string;
  annualRevenueRange?: string;
  employeeCount?: number;
  billingTerms?: BillingTerms;
  creditLimit?: number;
  referralSource?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  matters?: Matter[];
  clientDocuments?: ClientDocument[];
}

export interface Matter {
  id: string;
  matterCode: string;
  title: string;
  clientName: string;
  clientId?: string;
  practiceArea: string;
  status: 'Active' | 'Pending' | 'Closed';
  billableTargetHours?: number;
  leadAttorneyName?: string;
  createdAt: string;
  description?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'PARTNER' | 'ASSOCIATE' | 'PARALEGAL' | 'CLIENT';
}

export interface Document {
  id: string;
  name: string;
  template: string;
  content: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Automation {
  id: string;
  name: string;
  trigger: string;
  action: string;
  isActive: boolean;
  createdAt: string;
}

export interface ClientDirectoryEntry {
  id: string;
  name: string;
  contactName: string;
  contactTitle: string;
  initials: string;
  activeMatters: number;
  email: string;
  phone: string;
  industry: string;
  status: string;
  avatarUrl?: string;
  balance: number;
  createdAt: string;
  billingAddress?: unknown;
}

export interface MatterActivity {
  id: string;
  description: string;
  type: string;
  timestamp: string;
  status?: string;
  offsetClass?: string;
  side?: string;
  date?: string;
  title?: string;
  authorInitials: string;
  author: string;
  hours?: string;
  files?: number;
}