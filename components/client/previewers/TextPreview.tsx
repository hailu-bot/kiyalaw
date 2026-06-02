'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function TextPreview({ url }: { url: string }) {
  const [text, setText] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(url)
      .then((r) => r.text())
      .then(setText)
      .catch(() => setText('Failed to load file content.'))
      .finally(() => setLoading(false));
  }, [url]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-[#76767e]">
        <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading...
      </div>
    );
  }

  return (
    <pre className="p-4 font-body-md text-[14px] text-[#0A1128] bg-[#f8f9ff] border border-[#c6c6ce]/30 overflow-auto max-h-[70vh] whitespace-pre-wrap">
      {text}
    </pre>
  );
}
