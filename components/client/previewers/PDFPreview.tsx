'use client';

export default function PDFPreview({ url }: { url: string }) {
  return (
    <div className="w-full min-h-[500px] bg-[#f8f9ff]">
      <iframe
        src={url}
        className="w-full h-[80vh] border-0"
        title="PDF Preview"
      />
    </div>
  );
}
