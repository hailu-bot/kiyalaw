/* eslint-disable @next/next/no-img-element */
'use client';

import { useRef } from 'react';
import { Upload, Trash2, FileText } from 'lucide-react';
import { DOCUMENT_LABELS } from '@/lib/constants';
import type { WizardData } from './types';

type Props = {
  data: WizardData;
  updateField: <K extends keyof WizardData>(field: K, value: WizardData[K]) => void;
  errors: Partial<Record<keyof WizardData, string>>;
};

export default function StepDocumentUpload({ data, updateField, errors }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newDocs = files.map((file) => ({
      file,
      label: '',
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
    }));
    updateField('documents', [...data.documents, ...newDocs]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeDocument = (index: number) => {
    const doc = data.documents[index];
    if (doc.preview) URL.revokeObjectURL(doc.preview);
    updateField('documents', data.documents.filter((_, i) => i !== index));
  };

  const updateLabel = (index: number, label: string) => {
    const updated = data.documents.map((d, i) => (i === index ? { ...d, label } : d));
    updateField('documents', updated);
  };

  return (
    <div className="space-y-6">
      <h3 className="font-headline-sm text-headline-sm text-[#0A1128]">Document Upload</h3>
      <p className="font-body-md text-body-md text-[#46464d] -mt-4">
        Upload corporate documents for this client. Assign a label to each file.
      </p>

      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-[#c6c6ce]/60 p-8 text-center cursor-pointer hover:border-[#D4AF37] transition-colors bg-[#f8f9ff]"
      >
        <Upload className="h-8 w-8 text-[#76767e] mx-auto mb-3" />
        <p className="font-body-md text-body-md text-[#46464d]">Click to upload or drag and drop files</p>
        <p className="font-label-sm text-label-sm text-[#76767e] mt-1">PDF, DOCX, images, and text files</p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.doc,.txt,.png,.jpg,.jpeg,.gif,.tiff"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {data.documents.length > 0 && (
        <div className="space-y-3">
          {data.documents.map((doc, index) => (
            <div key={index} className="flex items-center gap-4 bg-white border border-[#c6c6ce]/40 p-4">
              {doc.preview ? (
                <img src={doc.preview} alt="" className="h-10 w-10 object-cover border border-[#c6c6ce]/20" />
              ) : (
                <div className="h-10 w-10 flex items-center justify-center bg-[#f8f9ff] border border-[#c6c6ce]/20">
                  <FileText className="h-5 w-5 text-[#76767e]" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-body-md text-body-md text-[#0A1128] truncate">{doc.file?.name}</p>
                <p className="font-label-sm text-label-sm text-[#76767e]">
                  {doc.file ? `${(doc.file.size / 1024).toFixed(1)} KB` : ''}
                </p>
              </div>
              <select
                value={doc.label}
                onChange={(e) => updateLabel(index, e.target.value)}
                className="w-48 border-b border-[#c6c6ce]/60 bg-transparent py-2 font-body-md text-[13px] text-[#0A1128] focus:border-[#D4AF37] focus:ring-0 outline-none transition-colors cursor-pointer"
              >
                <option value="">Select label...</option>
                {DOCUMENT_LABELS.map((lbl) => (
                  <option key={lbl.value} value={lbl.value}>{lbl.label}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => removeDocument(index)}
                className="text-red-400 hover:text-red-600 transition-colors cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {errors.documents && <p className="text-red-500 text-[12px]">{errors.documents}</p>}
    </div>
  );
}
