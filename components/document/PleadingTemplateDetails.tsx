'use client';

import React from 'react';

interface PleadingTemplateDetailsProps {
  templateId: string;
}

export default function PleadingTemplateDetails({ templateId }: PleadingTemplateDetailsProps) {
  return (
    <div className="p-4 bg-slate-800 text-white rounded">
      <h2 className="text-lg font-bold">Pleading Template Details</h2>
      <p className="mt-2 text-sm">Placeholder component for pleading template details. ID: {templateId}</p>
    </div>
  );
}
