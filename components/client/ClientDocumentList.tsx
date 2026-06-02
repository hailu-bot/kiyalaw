'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, Eye, Trash2 } from 'lucide-react';
import { deleteClientDocument } from '@/app/actions/clientActions';
import ClientDocumentPreviewer from './ClientDocumentPreviewer';
import { useToastStore } from '@/lib/store/useToastStore';
import { useRouter } from 'next/navigation';

type ClientDoc = {
  id: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  label: string;
  fileUrl: string;
  metadata?: Record<string, unknown> | null;
  uploadedAt: string;
};

type Props = {
  clientId: string;
  documents: ClientDoc[];
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

const LABEL_COLORS: Record<string, string> = {
  CertificateOfIncorporation: 'bg-blue-100 text-blue-800',
  TaxDocument: 'bg-orange-100 text-orange-800',
  BusinessLicense: 'bg-green-100 text-green-800',
  Identification: 'bg-purple-100 text-purple-800',
  Contract: 'bg-red-100 text-red-800',
  CourtFiling: 'bg-yellow-100 text-yellow-800',
  FinancialStatement: 'bg-teal-100 text-teal-800',
  InsuranceCertificate: 'bg-pink-100 text-pink-800',
  ComplianceDocument: 'bg-indigo-100 text-indigo-800',
  Other: 'bg-gray-100 text-gray-800',
};

const LABEL_DISPLAY: Record<string, string> = {
  CertificateOfIncorporation: 'Certificate of Incorporation',
  TaxDocument: 'Tax Document',
  BusinessLicense: 'Business License',
  Identification: 'Identification',
  Contract: 'Contract',
  CourtFiling: 'Court Filing',
  FinancialStatement: 'Financial Statement',
  InsuranceCertificate: 'Insurance Certificate',
  ComplianceDocument: 'Compliance Document',
  Other: 'Other',
};

export default function ClientDocumentList({ clientId, documents }: Props) {
  const router = useRouter();
  const addToast = useToastStore((s) => s.addToast);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<ClientDoc | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.set('file', file);
      formData.set('clientId', clientId);
      formData.set('label', 'Other');

      const resp = await fetch('/api/upload/client-document', {
        method: 'POST',
        body: formData,
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: 'Upload failed' }));
        addToast(err.error || 'Upload failed', 'error');
      } else {
        addToast('Document uploaded.', 'success');
        router.refresh();
      }
    } catch {
      addToast('Upload failed.', 'error');
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = async (docId: string) => {
    const result = await deleteClientDocument(docId, clientId);
    if (result.success) {
      addToast('Document deleted.', 'success');
      router.refresh();
    } else {
      addToast(result.message || 'Failed to delete.', 'error');
    }
  };

  return (
    <section className="mb-10">
      <ClientDocumentPreviewer doc={previewDoc} onClose={() => setPreviewDoc(null)} />

      <div className="flex items-center justify-between mb-5">
        <h2 className="font-headline-sm text-headline-sm text-[#0A1128] flex items-center gap-3">
          <FileText className="h-5 w-5 text-[#D4AF37]" /> Documents
        </h2>
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 bg-[#0A1128] text-white px-5 py-2 font-label-sm text-label-sm uppercase tracking-wider hover:bg-[#162244] transition-colors disabled:opacity-60 cursor-pointer"
          >
            <Upload className="h-4 w-4" />
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>

      {documents.length === 0 ? (
        <div className="bg-[#f8f9ff] border border-[#c6c6ce]/30 p-8 text-center">
          <FileText className="h-8 w-8 text-[#c6c6ce] mx-auto mb-3" />
          <p className="font-body-md text-body-md text-[#46464d]">No documents uploaded yet.</p>
          <p className="font-label-sm text-label-sm text-[#76767e] mt-1">Upload incorporation certificates, tax documents, contracts, and more.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-white border border-[#c6c6ce]/50 p-4 hover:border-[#D4AF37]/50 transition-colors group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="h-5 w-5 text-[#D4AF37] shrink-0" />
                  <p className="font-body-md text-body-md text-[#0A1128] truncate font-medium">{doc.originalName}</p>
                </div>
              </div>

              <span className={`inline-block text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider ${LABEL_COLORS[doc.label] || 'bg-gray-100 text-gray-800'}`}>
                {LABEL_DISPLAY[doc.label] || doc.label}
              </span>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#c6c6ce]/20 text-[11px] text-[#76767e]">
                <span>{formatSize(doc.fileSize)}</span>
                <span>{formatDate(doc.uploadedAt)}</span>
              </div>

              <div className="flex gap-2 mt-3 pt-3 border-t border-[#c6c6ce]/20">
                <button
                  onClick={() => setPreviewDoc(doc)}
                  className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#0A1128] hover:text-[#D4AF37] transition-colors cursor-pointer"
                >
                  <Eye className="h-3.5 w-3.5" /> Preview
                </button>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-red-400 hover:text-red-600 transition-colors ml-auto cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
