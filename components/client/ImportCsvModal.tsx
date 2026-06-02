'use client';

import { useState, useRef } from 'react';
import { X, Upload, Download, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import Papa from 'papaparse';
import { normalizeCsvRow, validateCsvRow, CLIENT_CSV_COLUMNS, ENUM_VALUES } from '@/lib/csv-import';
import { bulkCreateClients } from '@/app/actions/clientActions';
import type { BulkClientInput } from '@/app/actions/clientActions';

type Props = {
  open: boolean;
  onClose: () => void;
};

type PreviewRow = {
  index: number;
  data: Record<string, string>;
  valid: boolean;
  error?: string;
};

type ImportResult = {
  index: number;
  name: string;
  success: boolean;
  error?: string;
};

export default function ImportCsvModal({ open, onClose }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rawRows, setRawRows] = useState<Record<string, string>[] | null>(null);
  const [preview, setPreview] = useState<PreviewRow[] | null>(null);
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<ImportResult[] | null>(null);
  const [fileName, setFileName] = useState('');

  if (!open) return null;

  const handleFile = (file: File | null) => {
    if (!file) return;
    setFileName(file.name);
    setResults(null);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (parsed) => {
        const rows = parsed.data as Record<string, string>[];
        setRawRows(rows);
        const cols = parsed.meta.fields ?? [];
        const missing = CLIENT_CSV_COLUMNS.filter((c) => !cols.includes(c));
        const previewRows = rows.map((r, i) => {
          const normalized = normalizeCsvRow(r);
          const error = validateCsvRow(normalized, i);
          return { index: i, data: r, valid: !error, error: error ?? undefined };
        });
        setPreview(previewRows);
        if (missing.length > 0) {
          setPreview((prev) => prev ?? []);
        }
      },
      error: () => {
        setPreview([]);
      },
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'text/csv') handleFile(file);
  };

  const handleImport = async () => {
    if (!rawRows || rawRows.length === 0) return;
    setImporting(true);
    const validRows: BulkClientInput[] = [];
    for (let i = 0; i < rawRows.length; i++) {
      const normalized = normalizeCsvRow(rawRows[i]);
      if (validateCsvRow(normalized, i)) continue;
      const registeredAddress: Record<string, string> = {};
      const billingAddress: Record<string, string> = {};
      const streetFields = ['Street', 'City', 'State', 'Zip', 'Country'] as const;
      for (const f of streetFields) {
        const rk = `registeredAddress${f}` as keyof typeof normalized;
        const bk = `billingAddress${f}` as keyof typeof normalized;
        registeredAddress[f.toLowerCase()] = normalized[rk] || '';
        billingAddress[f.toLowerCase()] = normalized[bk] || '';
      }
      const empStr = normalized.employeeCount;
      const emp = empStr ? parseInt(empStr, 10) : null;
      const clStr = normalized.creditLimit;
      const cl = clStr ? parseFloat(clStr) : null;
      const tagsStr = normalized.tags;
      const tags = tagsStr ? tagsStr.split(',').map((t) => t.trim()).filter(Boolean) : [];
      validRows.push({
        name: normalized.name,
        contactName: normalized.contactName || undefined,
        contactTitle: normalized.contactTitle || undefined,
        email: normalized.email || undefined,
        phone: normalized.phone || undefined,
        industry: normalized.industry || undefined,
        status: normalized.status || undefined,
        notes: normalized.notes || undefined,
        registrationNumber: normalized.registrationNumber || undefined,
        taxId: normalized.taxId || undefined,
        vatNumber: normalized.vatNumber || undefined,
        businessType: normalized.businessType || undefined,
        dateOfIncorporation: normalized.dateOfIncorporation || undefined,
        jurisdiction: normalized.jurisdiction || undefined,
        registeredAddress: Object.values(registeredAddress).some(Boolean) ? registeredAddress : undefined,
        billingAddress: Object.values(billingAddress).some(Boolean) ? billingAddress : undefined,
        website: normalized.website || undefined,
        annualRevenueRange: normalized.annualRevenueRange || undefined,
        employeeCount: emp,
        billingTerms: normalized.billingTerms || undefined,
        creditLimit: cl,
        referralSource: normalized.referralSource || undefined,
        tags,
      });
    }
    const result = await bulkCreateClients(validRows);
    if (result.success && 'results' in result) {
      setResults(result.results);
    }
    setImporting(false);
  };

  const reset = () => {
    setRawRows(null);
    setPreview(null);
    setResults(null);
    setFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const successCount = results ? results.filter((r) => r.success).length : 0;
  const failCount = results ? results.filter((r) => !r.success).length : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 bg-black/40">
      <div className="bg-white w-full max-w-4xl mx-4 max-h-[85vh] flex flex-col shadow-xl rounded-none">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#c6c6ce]/30">
          <div>
            <h2 className="font-headline-sm text-headline-sm text-[#0A1128]">Import Clients from CSV</h2>
            <p className="font-body-md text-body-md text-[#46464d] mt-1">
              Download the template, fill in your data, then upload.
            </p>
          </div>
          <button onClick={handleClose} className="text-[#76767e] hover:text-[#0A1128] transition-colors cursor-pointer">
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto px-6 py-5 space-y-5">
          {/* Template download */}
          <div className="flex items-center gap-3 bg-[#f8f9ff] border border-[#c6c6ce]/30 px-4 py-3">
            <Download className="h-5 w-5 text-[#D4AF37]" />
            <span className="font-body-md text-body-md text-[#46464d]">
              Don&apos;t have data formatted yet?
            </span>
            <a
              href="/api/export/clients/template"
              download
              className="ml-auto font-label-md text-label-md text-[#0A1128] underline underline-offset-2 hover:text-[#D4AF37] transition-colors"
            >
              Download CSV Template
            </a>
          </div>

          {/* Upload area */}
          {!preview && !results && (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-[#c6c6ce] p-10 text-center hover:border-[#D4AF37]/50 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-10 w-10 text-[#76767e] mx-auto mb-3" />
              <p className="font-body-md text-body-md text-[#46464d]">
                Drag & drop your CSV file here, or click to browse
              </p>
              <p className="font-label-sm text-label-sm text-[#76767e] mt-1">.csv files only</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
              />
            </div>
          )}

          {/* Preview table */}
          {preview && !results && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-[#0A1128]">
                  {fileName} &mdash; {rawRows?.length ?? 0} row(s) found
                </span>
                <div className="flex gap-3">
                  <button
                    onClick={reset}
                    className="px-4 py-2 border border-[#c6c6ce]/50 text-[#46464d] font-label-md text-label-md hover:bg-[#f8f9ff] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={importing || (preview?.filter((p) => p.valid).length ?? 0) === 0}
                    className="bg-[#0A1128] text-white px-5 py-2 font-label-md text-label-md uppercase tracking-wider hover:bg-[#162244] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    {importing && <Loader2 className="h-4 w-4 animate-spin" />}
                    Import {rawRows?.length ?? 0} Client{rawRows?.length !== 1 ? 's' : ''}
                  </button>
                </div>
              </div>
              <div className="overflow-auto max-h-64 border border-[#c6c6ce]/30">
                <table className="w-full text-left text-[13px]">
                  <thead className="bg-[#f8f9ff] sticky top-0">
                    <tr>
                      <th className="px-3 py-2 font-bold text-[11px] uppercase tracking-wider text-[#46464d]">#</th>
                      <th className="px-3 py-2 font-bold text-[11px] uppercase tracking-wider text-[#46464d]">Status</th>
                      <th className="px-3 py-2 font-bold text-[11px] uppercase tracking-wider text-[#46464d]">Name</th>
                      <th className="px-3 py-2 font-bold text-[11px] uppercase tracking-wider text-[#46464d]">Contact</th>
                      <th className="px-3 py-2 font-bold text-[11px] uppercase tracking-wider text-[#46464d]">Email</th>
                      <th className="px-3 py-2 font-bold text-[11px] uppercase tracking-wider text-[#46464d]">Industry</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row) => (
                      <tr key={row.index} className="border-t border-[#c6c6ce]/20 hover:bg-[#f8f9ff]/50">
                        <td className="px-3 py-2 text-[#76767e]">{row.index + 1}</td>
                        <td className="px-3 py-2">
                          {row.valid ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <span title={row.error}>
                              <AlertTriangle className="h-4 w-4 text-amber-600" />
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 font-medium text-[#0A1128]">{row.data.Name || <span className="text-red-500 italic">missing</span>}</td>
                        <td className="px-3 py-2 text-[#46464d]">{row.data['Contact Name'] || '-'}</td>
                        <td className="px-3 py-2 text-[#46464d]">{row.data.Email || '-'}</td>
                        <td className="px-3 py-2 text-[#46464d]">{row.data.Industry || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {preview.filter((p) => !p.valid).length > 0 && (
                <div className="bg-amber-50 border border-amber-200 px-4 py-2 text-[13px] text-amber-800">
                  {preview.filter((p) => !p.valid).length} row(s) have errors and will be skipped. Only rows with valid names will be imported.
                </div>
              )}
            </div>
          )}

          {/* Results after import */}
          {results && (
            <div className="space-y-3">
              <div className="flex items-center gap-4 bg-[#f8f9ff] border border-[#c6c6ce]/30 px-4 py-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-label-md text-label-md text-[#0A1128]">
                    Import complete &mdash; {successCount} of {results.length} client(s) created
                  </p>
                  {failCount > 0 && (
                    <p className="font-body-md text-body-md text-red-600">{failCount} row(s) failed</p>
                  )}
                </div>
                <button
                  onClick={handleClose}
                  className="ml-auto bg-[#0A1128] text-white px-5 py-2 font-label-md text-label-md uppercase tracking-wider hover:bg-[#162244] transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
              {failCount > 0 && (
                <div className="overflow-auto max-h-48 border border-[#c6c6ce]/30">
                  <table className="w-full text-left text-[13px]">
                    <thead className="bg-[#f8f9ff] sticky top-0">
                      <tr>
                        <th className="px-3 py-2 font-bold text-[11px] uppercase tracking-wider text-[#46464d]">Row</th>
                        <th className="px-3 py-2 font-bold text-[11px] uppercase tracking-wider text-[#46464d]">Name</th>
                        <th className="px-3 py-2 font-bold text-[11px] uppercase tracking-wider text-[#46464d]">Result</th>
                        <th className="px-3 py-2 font-bold text-[11px] uppercase tracking-wider text-[#46464d]">Error</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.filter((r) => !r.success).map((r) => (
                        <tr key={r.index} className="border-t border-[#c6c6ce]/20">
                          <td className="px-3 py-2 text-[#76767e]">{r.index + 1}</td>
                          <td className="px-3 py-2 text-[#0A1128]">{r.name}</td>
                          <td className="px-3 py-2">
                            <span className="text-red-600 font-medium">Failed</span>
                          </td>
                          <td className="px-3 py-2 text-[#46464d]">{r.error}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Enum reference info */}
          {!preview && !results && (
            <details className="text-[13px] text-[#46464d] border border-[#c6c6ce]/30">
              <summary className="px-4 py-2 cursor-pointer font-label-md text-label-md text-[#0A1128] hover:bg-[#f8f9ff]">
                Accepted values reference
              </summary>
              <div className="px-4 py-3 space-y-2 border-t border-[#c6c6ce]/20">
                {Object.entries(ENUM_VALUES).map(([field, values]) => (
                  <div key={field}>
                    <span className="font-bold">{field}:</span>{' '}
                    {values.map((v, i) => (
                      <span key={v}>
                        {i > 0 && <span> | </span>}
                        <code className="bg-[#f0f0f5] px-1.5 py-0.5 text-[12px]">{v}</code>
                      </span>
                    ))}
                  </div>
                ))}
                <div className="mt-2 text-[12px] text-[#76767e]">
                  <strong>Date of Incorporation:</strong> YYYY-MM-DD format<br />
                  <strong>Tags:</strong> comma-separated list<br />
                  All fields except <strong>Name</strong> are optional.
                </div>
              </div>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}
