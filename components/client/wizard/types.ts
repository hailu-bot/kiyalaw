export interface WizardMatter {
  title: string;
  matterCode: string;
  practiceArea: string;
  leadAttorneyName: string;
  description: string;
}

export interface WizardDocument {
  file: File | null;
  label: string;
  preview?: string;
}

export interface WizardData {
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
  billingAddressSame: boolean;
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
  matters: WizardMatter[];
  documents: WizardDocument[];
}

export const defaultWizardData: WizardData = {
  name: '',
  contactName: '',
  contactTitle: '',
  email: '',
  phone: '',
  industry: '',
  status: 'Active',
  notes: '',
  registrationNumber: '',
  taxId: '',
  vatNumber: '',
  businessType: '',
  dateOfIncorporation: '',
  jurisdiction: '',
  registeredAddressStreet: '',
  registeredAddressCity: '',
  registeredAddressState: '',
  registeredAddressZip: '',
  registeredAddressCountry: '',
  billingAddressSame: true,
  billingAddressStreet: '',
  billingAddressCity: '',
  billingAddressState: '',
  billingAddressZip: '',
  billingAddressCountry: '',
  website: '',
  annualRevenueRange: '',
  employeeCount: '',
  billingTerms: '',
  creditLimit: '',
  referralSource: '',
  tags: '',
  matters: [{ title: '', matterCode: '', practiceArea: '', leadAttorneyName: '', description: '' }],
  documents: [],
};
