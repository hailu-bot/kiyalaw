'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function DocxPreview({ url }: { url: string }) {
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(url)
      .then((r) => r.arrayBuffer())
      .then((buffer) => {
        const formData = new FormData();
        formData.set('file', new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }));
        return fetch('/api/documents/import', { method: 'POST', body: formData });
      })
      .then((r) => r.json())
      .then((data) => {
        if (data.html) setHtml(data.html);
        else setError(data.error || 'Preview not available');
      })
      .catch((e: Error) => setError(e.message || 'Failed to preview document'))
      .finally(() => setLoading(false));
  }, [url]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-[#76767e]">
        <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 bg-red-50 border border-red-200">
        <p>Failed to preview document: {error}</p>
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-[#0A1128] underline mt-2 inline-block">
          Download file instead
        </a>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white border border-[#c6c6ce]/30 overflow-auto max-h-[70vh]">
      <div dangerouslySetInnerHTML={{ __html: html || '' }} />
    </div>
  );
}
