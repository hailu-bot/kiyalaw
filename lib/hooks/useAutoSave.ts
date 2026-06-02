'use client';

import { useEffect, useRef } from 'react';
import { useDocumentStore } from '../store/useDocumentStore';

const DEBOUNCE_MS = 3000;

export function useAutoSave() {
  const documentId = useDocumentStore((s) => s.documentId);
  const editorHTML = useDocumentStore((s) => s.editorHTML);
  const isDirty = useDocumentStore((s) => s.isDirty);
  const setSaving = useDocumentStore((s) => s.setSaving);
  const setDirty = useDocumentStore((s) => s.setDirty);
  const setLastSaved = useDocumentStore((s) => s.setLastSaved);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isDirty || !documentId || !editorHTML) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      setSaving(true);
      try {
        const res = await fetch(`/api/documents/${documentId}/versions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ body: { html: editorHTML } }),
        });
        if (res.ok) {
          setDirty(false);
          setLastSaved(new Date());
        }
      } catch {
        // Silently fail — will retry on next change
      } finally {
        setSaving(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  // editorHTML intentionally omitted: captured by closure at fire-time (always
  // fresh). Including it would reset the debounce on every keystroke.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDirty, documentId, setSaving, setDirty, setLastSaved]);
}
