'use client';

import ImagePreview from './ImagePreview';
import PDFPreview from './PDFPreview';
import TextPreview from './TextPreview';
import DocxPreview from './DocxPreview';

export default function PreviewRouter({ url, mimeType }: { url: string; mimeType: string }) {
  if (mimeType.startsWith('image/')) {
    return <ImagePreview url={url} />;
  }

  if (mimeType === 'application/pdf') {
    return <PDFPreview url={url} />;
  }

  if (
    mimeType === 'text/plain' ||
    mimeType === 'text/html' ||
    mimeType === 'application/json' ||
    mimeType === 'application/xml'
  ) {
    return <TextPreview url={url} />;
  }

  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimeType === 'application/msword'
  ) {
    return <DocxPreview url={url} />;
  }

  return (
    <div className="flex flex-col items-center justify-center p-12 text-[#76767e]">
      <p className="font-body-md text-body-md mb-4">Preview not available for this file type.</p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-[#0A1128] text-white px-6 py-2 font-label-sm text-label-sm uppercase tracking-wider hover:bg-[#162244] transition-colors"
      >
        Download File
      </a>
    </div>
  );
}
