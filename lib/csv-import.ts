export const CLIENT_CSV_COLUMNS = [
  'Name',
  'Contact Name',
  'Contact Title',
  'Email',
  'Phone',
  'Industry',
  'Status',
  'Notes',
  'Registration Number',
  'Tax ID',
  'VAT Number',
  'Business Type',
  'Date of Incorporation',
  'Jurisdiction',
  'Registered Address Street',
  'Registered Address City',
  'Registered Address State',
  'Registered Address Zip',
  'Registered Address Country',
  'Billing Address Street',
  'Billing Address City',
  'Billing Address State',
  'Billing Address Zip',
  'Billing Address Country',
  'Website',
  'Annual Revenue Range',
  'Employee Count',
  'Billing Terms',
  'Credit Limit',
  'Referral Source',
  'Tags',
] as const;

export const CLIENT_CSV_TEMPLATE: Record<string, string> = {
  Name: 'Acme Corp',
  'Contact Name': 'John Doe',
  'Contact Title': 'CEO',
  Email: 'john@acme.com',
  Phone: '+1-555-0123',
  Industry: 'Technology',
  Status: 'Active',
  Notes: 'Key corporate client',
  'Registration Number': 'RC-2024-001',
  'Tax ID': 'TAX-12345',
  'VAT Number': 'VAT-GB-98765',
  'Business Type': 'Corporation',
  'Date of Incorporation': '2020-01-15',
  Jurisdiction: 'Delaware',
  'Registered Address Street': '123 Main St',
  'Registered Address City': 'Wilmington',
  'Registered Address State': 'DE',
  'Registered Address Zip': '19801',
  'Registered Address Country': 'USA',
  'Billing Address Street': '456 Oak Ave',
  'Billing Address City': 'New York',
  'Billing Address State': 'NY',
  'Billing Address Zip': '10001',
  'Billing Address Country': 'USA',
  Website: 'https://acme.com',
  'Annual Revenue Range': '$10M - $50M',
  'Employee Count': '250',
  'Billing Terms': 'Net30',
  'Credit Limit': '50000',
  'Referral Source': 'Referral from ABC Law',
  Tags: 'corporate, technology, priority',
};

export const ENUM_VALUES = {
  Status: ['Active', 'Inactive', 'Prospect'],
  'Business Type': ['LLC', 'Corporation', 'Partnership', 'SoleProprietorship', 'NonProfit', 'Other'],
  'Billing Terms': ['Net15', 'Net30', 'Net45', 'Net60', 'Net90', 'DueOnReceipt'],
};

export interface CsvClientRow {
  name: string;
  contactName: string;
  contactTitle: string;
  email: string;
  phone: string;
  industry: string;
  status: string;
  notes: string;
  registrationNumber: string;
  taxId: string;
  vatNumber: string;
  businessType: string;
  dateOfIncorporation: string;
  jurisdiction: string;
  registeredAddressStreet: string;
  registeredAddressCity: string;
  registeredAddressState: string;
  registeredAddressZip: string;
  registeredAddressCountry: string;
  billingAddressStreet: string;
  billingAddressCity: string;
  billingAddressState: string;
  billingAddressZip: string;
  billingAddressCountry: string;
  website: string;
  annualRevenueRange: string;
  employeeCount: string;
  billingTerms: string;
  creditLimit: string;
  referralSource: string;
  tags: string;
}

export function normalizeCsvRow(row: Record<string, string>): CsvClientRow {
  const get = (key: string) => (row[key] ?? '').trim();
  return {
    name: get('Name'),
    contactName: get('Contact Name'),
    contactTitle: get('Contact Title'),
    email: get('Email'),
    phone: get('Phone'),
    industry: get('Industry'),
    status: get('Status'),
    notes: get('Notes'),
    registrationNumber: get('Registration Number'),
    taxId: get('Tax ID'),
    vatNumber: get('VAT Number'),
    businessType: get('Business Type'),
    dateOfIncorporation: get('Date of Incorporation'),
    jurisdiction: get('Jurisdiction'),
    registeredAddressStreet: get('Registered Address Street'),
    registeredAddressCity: get('Registered Address City'),
    registeredAddressState: get('Registered Address State'),
    registeredAddressZip: get('Registered Address Zip'),
    registeredAddressCountry: get('Registered Address Country'),
    billingAddressStreet: get('Billing Address Street'),
    billingAddressCity: get('Billing Address City'),
    billingAddressState: get('Billing Address State'),
    billingAddressZip: get('Billing Address Zip'),
    billingAddressCountry: get('Billing Address Country'),
    website: get('Website'),
    annualRevenueRange: get('Annual Revenue Range'),
    employeeCount: get('Employee Count'),
    billingTerms: get('Billing Terms'),
    creditLimit: get('Credit Limit'),
    referralSource: get('Referral Source'),
    tags: get('Tags'),
  };
}

export function validateCsvRow(row: CsvClientRow, index: number): string | null {
  if (!row.name) return `Row ${index + 2}: Name is required.`;
  return null;
}
