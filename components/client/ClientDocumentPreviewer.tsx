'use client';

import React, { useState } from 'react';
import { X, Download, FileText, Calendar, Tag, HardDrive } from 'lucide-react';
import PreviewRouter from './previewers/PreviewRouter';

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
  doc: ClientDoc | null;
  onClose: () => void;
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
    hour: '2-digit',
    minute: '2-digit',
  });
}

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

export default function ClientDocumentPreviewer({ doc, onClose }: Props) {
  const [tab, setTab] = useState<'preview' | 'metadata'>('preview');

  if (!doc) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A1128]/75 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-4xl bg-white border border-[#c6c6ce]/50 shadow-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#c6c6ce]/30 px-6 py-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <FileText className="h-5 w-5 text-[#D4AF37] shrink-0" />
            <h2 className="font-headline-sm text-headline-sm text-[#0A1128] truncate">{doc.originalName}</h2>
          </div>
          <button onClick={onClose} className="text-[#76767e] hover:text-[#0A1128] cursor-pointer shrink-0">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#c6c6ce]/30 px-6 shrink-0">
          <button
            onClick={() => setTab('preview')}
            className={`px-4 py-3 font-label-sm text-label-sm uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
              tab === 'preview' ? 'border-[#D4AF37] text-[#0A1128]' : 'border-transparent text-[#76767e] hover:text-[#0A1128]'
            }`}
          >
            Preview
          </button>
          <button
            onClick={() => setTab('metadata')}
            className={`px-4 py-3 font-label-sm text-label-sm uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
              tab === 'metadata' ? 'border-[#D4AF37] text-[#0A1128]' : 'border-transparent text-[#76767e] hover:text-[#0A1128]'
            }`}
          >
            Metadata
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {tab === 'preview' ? (
            <PreviewRouter url={doc.fileUrl} mimeType={doc.mimeType} />
          ) : (
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-[140px_1fr] gap-3 text-[14px]">
                <span className="font-label-sm text-label-sm text-[#76767e] uppercase tracking-wider">File Name</span>
                <span className="font-body-md text-[#0A1128]">{doc.originalName}</span>

                <span className="font-label-sm text-label-sm text-[#76767e] uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5" /> Label
                </span>
                <span className="font-body-md text-[#0A1128]">{LABEL_DISPLAY[doc.label] || doc.label}</span>

                <span className="font-label-sm text-label-sm text-[#76767e] uppercase tracking-wider flex items-center gap-1.5">
                  <HardDrive className="h-3.5 w-3.5" /> Size
                </span>
                <span className="font-body-md text-[#0A1128]">{formatSize(doc.fileSize)}</span>

                <span className="font-label-sm text-label-sm text-[#76767e] uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" /> Type
                </span>
                <span className="font-body-md text-[#0A1128]">{doc.mimeType}</span>

                <span className="font-label-sm text-label-sm text-[#76767e] uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" /> Uploaded
                </span>
                <span className="font-body-md text-[#0A1128]">{formatDate(doc.uploadedAt)}</span>
              </div>

              {doc.metadata && Object.keys(doc.metadata).length > 0 && (
                <div className="pt-4 border-t border-[#c6c6ce]/30">
                  <h4 className="font-label-sm text-label-sm text-[#0A1128] uppercase tracking-wider font-bold mb-3">Extracted Data</h4>
                  <div className="grid grid-cols-[140px_1fr] gap-3 text-[14px]">
                    {Object.entries(doc.metadata).map(([key, value]) => (
                      <React.Fragment key={key}>
                        <span className="font-label-sm text-label-sm text-[#76767e] uppercase tracking-wider">{key}</span>
                        <span className="font-body-md text-[#0A1128]">{String(value)}</span>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4">
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#0A1128] text-white px-6 py-2 font-label-sm text-label-sm uppercase tracking-wider hover:bg-[#162244] transition-colors"
                >
                  <Download className="h-4 w-4" /> Download
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


