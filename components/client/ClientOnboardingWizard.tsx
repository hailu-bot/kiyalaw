'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { X, Check, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import { useToastStore } from '@/lib/store/useToastStore';
import { createClientFull } from '@/app/actions/clientActions';
import { createMatter } from '@/app/actions/matterActions';
import StepCompanyInfo from './wizard/StepCompanyInfo';
import StepContactAddress from './wizard/StepContactAddress';
import StepFinancialDetails from './wizard/StepFinancialDetails';
import StepMatterCreation from './wizard/StepMatterCreation';
import StepDocumentUpload from './wizard/StepDocumentUpload';
import { defaultWizardData } from './wizard/types';
import type { WizardData } from './wizard/types';

const STEPS = [
  { label: 'Company Info', component: StepCompanyInfo },
  { label: 'Contact & Address', component: StepContactAddress },
  { label: 'Financial Details', component: StepFinancialDetails },
  { label: 'Matter Creation', component: StepMatterCreation },
  { label: 'Documents', component: StepDocumentUpload },
];

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function ClientOnboardingWizard({ open, onClose }: Props) {
  const router = useRouter();
  const { addToast, updateToast } = useToastStore();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState<WizardData>(defaultWizardData);
  const [errors, setErrors] = useState<Partial<Record<keyof WizardData, string>>>({});

  const updateField = useCallback(<K extends keyof WizardData>(field: K, value: WizardData[K]) => {
    setData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  const validateStep = useCallback((stepIndex: number): boolean => {
    const newErrors: Partial<Record<keyof WizardData, string>> = {};

    if (stepIndex === 0) {
      if (!data.name.trim()) newErrors.name = 'Client name is required';
    }

    if (stepIndex === 3) {
      const hasValidMatter = data.matters.some((m) => m.title.trim() && m.practiceArea.trim());
      if (!hasValidMatter) {
        newErrors.matters = 'At least one matter with a title and practice area is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [data]);

  const handleNext = () => {
    if (!validateStep(step)) return;
    if (step < STEPS.length - 1) setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(step)) return;
    setSubmitting(true);
    const toastId = addToast('Creating client...', 'pending');

    try {
      const formData = new FormData();
      formData.set('name', data.name);
      formData.set('contactName', data.contactName);
      formData.set('contactTitle', data.contactTitle);
      formData.set('email', data.email);
      formData.set('phone', data.phone);
      formData.set('industry', data.industry);
      formData.set('status', data.status);
      formData.set('notes', data.notes);
      formData.set('registrationNumber', data.registrationNumber);
      formData.set('taxId', data.taxId);
      formData.set('vatNumber', data.vatNumber);
      formData.set('businessType', data.businessType);
      formData.set('dateOfIncorporation', data.dateOfIncorporation);
      formData.set('jurisdiction', data.jurisdiction);
      formData.set('website', data.website);
      formData.set('annualRevenueRange', data.annualRevenueRange);
      formData.set('employeeCount', data.employeeCount);
      formData.set('billingTerms', data.billingTerms);
      formData.set('creditLimit', data.creditLimit);
      formData.set('referralSource', data.referralSource);
      formData.set('tags', data.tags);

      const registeredAddress = {
        street: data.registeredAddressStreet,
        city: data.registeredAddressCity,
        state: data.registeredAddressState,
        zip: data.registeredAddressZip,
        country: data.registeredAddressCountry,
      };
      formData.set('registeredAddress', JSON.stringify(registeredAddress));

      if (!data.billingAddressSame) {
        const billingAddress = {
          street: data.billingAddressStreet,
          city: data.billingAddressCity,
          state: data.billingAddressState,
          zip: data.billingAddressZip,
          country: data.billingAddressCountry,
        };
        formData.set('billingAddress', JSON.stringify(billingAddress));
      }

      const result = await createClientFull(formData);
      if (!result.success) {
        updateToast(toastId, result.message, 'error');
        setSubmitting(false);
        return;
      }

      const clientName = data.name;
      const clientId = result.clientId;

      for (const matter of data.matters) {
        if (!matter.title.trim() || !matter.practiceArea.trim()) continue;
        const mfd = new FormData();
        mfd.set('title', matter.title);
        mfd.set('matterCode', matter.matterCode || `MAT-${crypto.randomUUID().slice(0, 8)}`);
        mfd.set('clientName', clientName);
        mfd.set('practiceArea', matter.practiceArea);
        mfd.set('leadAttorneyName', matter.leadAttorneyName);
        mfd.set('description', matter.description);
        if (clientId) mfd.set('clientId', clientId);
        const matterResult = await createMatter(mfd);
        if (!matterResult.success) {
          addToast(`Matter "${matter.title}" failed: ${matterResult.message}`, 'error');
        }
      }

      for (const doc of data.documents) {
        if (!doc.file || !doc.label) continue;
        const uploadForm = new FormData();
        uploadForm.set('file', doc.file);
        uploadForm.set('label', doc.label);
        const uploadResp = await fetch('/api/upload/client-document', {
          method: 'POST',
          body: uploadForm,
        });
        if (!uploadResp.ok) {
          addToast(`Failed to upload "${doc.file.name}"`, 'error');
        }
      }

      updateToast(toastId, `Client "${clientName}" created successfully.`, 'success');
      setData(defaultWizardData);
      setStep(0);
      onClose();
      router.refresh();
    } catch (err) {
      updateToast(toastId, 'An unexpected error occurred.', 'error');
      console.error('Wizard submission failed:', err);
    }

    setSubmitting(false);
  };

  if (!open) return null;

  const StepComponent = STEPS[step].component;
  const isLastStep = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A1128]/75 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-3xl bg-white border border-[#c6c6ce]/50 shadow-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#c6c6ce]/30 px-6 py-4 shrink-0">
          <h2 className="font-headline-sm text-headline-sm text-[#0A1128]">New Client Onboarding</h2>
          <button onClick={onClose} className="text-[#76767e] hover:text-[#0A1128] cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step Progress */}
        <div className="flex items-center gap-1 px-6 py-4 bg-[#f8f9ff] border-b border-[#c6c6ce]/30 shrink-0">
          {STEPS.map((s, i) => (
            <div key={s.label} className="flex items-center gap-1 flex-1">
              <div
                className={`flex items-center justify-center h-7 w-7 rounded-full text-[11px] font-bold transition-colors ${
                  i < step
                    ? 'bg-[#0A1128] text-white'
                    : i === step
                    ? 'bg-[#D4AF37] text-[#0A1128]'
                    : 'bg-[#c6c6ce]/40 text-[#76767e]'
                }`}
              >
                {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span
                className={`text-[11px] font-bold uppercase tracking-wider hidden md:block ${
                  i === step ? 'text-[#0A1128]' : 'text-[#76767e]'
                }`}
              >
                {s.label}
              </span>
              {i < STEPS.length - 1 && <div className="flex-1 h-px bg-[#c6c6ce]/40 mx-1" />}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <StepComponent data={data} updateField={updateField} errors={errors} />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#c6c6ce]/30 px-6 py-4 shrink-0">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 0 || submitting}
            className="flex items-center gap-1.5 px-4 py-2 border border-[#c6c6ce] text-[#0A1128] font-label-sm text-label-sm uppercase tracking-wider hover:bg-[#f8f9ff] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 font-label-sm text-label-sm text-[#76767e] hover:text-[#0A1128] transition-colors cursor-pointer"
            >
              Cancel
            </button>

            {isLastStep ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 bg-[#0A1128] text-white px-6 py-2 font-label-sm text-label-sm uppercase tracking-wider hover:bg-[#162244] transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Creating...
                  </>
                ) : (
                  'Create Client'
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                disabled={submitting}
                className="flex items-center gap-1.5 bg-[#0A1128] text-white px-6 py-2 font-label-sm text-label-sm uppercase tracking-wider hover:bg-[#162244] transition-colors cursor-pointer"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
