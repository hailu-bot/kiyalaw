import React from 'react';
import MSJTemplateEditor from '@/components/document/MSJTemplateEditor';

export default async function MSJEditorPage({ params }: { params: Promise<{ msjId: string }> }) {
  await params;

  return <MSJTemplateEditor />;
}
