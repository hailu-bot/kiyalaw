/* eslint-disable @next/next/no-img-element */
'use client';

export default function ImagePreview({ url }: { url: string }) {
  return (
    <div className="flex items-center justify-center p-4 bg-[#f8f9ff] min-h-[300px]">
      <img src={url} alt="" className="max-w-full max-h-[70vh] object-contain shadow-sm" />
    </div>
  );
}
