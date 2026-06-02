import React from 'react';
import DocumentTemplateGallery from '@/components/document/DocumentTemplateGallery';

export default function TemplatesPage() {
  return (
    <div className="px-margin-mobile md:px-margin-desktop py-8 max-w-container-max mx-auto w-full flex-1">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-2">Document Templates</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">Select a template below to begin drafting, or start from scratch.</p>
        </div>
        <a
          href="/documents"
          className="bg-secondary text-on-secondary font-label-md text-label-md uppercase px-6 py-3 flex items-center gap-2 hover:bg-secondary-container hover:text-on-secondary-container transition-colors shadow-sm"
        >
          Create Blank Document
        </a>
      </div>
      <DocumentTemplateGallery />
    </div>
  );
}
