import React from 'react';
import PleadingTemplateDetails from '@/components/document/PleadingTemplateDetails';

export default async function TemplateDetailPage({ params }: { params: Promise<{ templateId: string }> }) {
  const { templateId } = await params;

  return (
    <div className="px-margin-mobile md:px-margin-desktop py-8 max-w-container-max mx-auto w-full flex-1">
      <PleadingTemplateDetails templateId={templateId} />
    </div>
  );
}
