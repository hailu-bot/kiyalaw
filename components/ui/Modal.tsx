import React from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}

export default function Modal({ open, onClose, children, title }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-surface border border-outline-variant rounded-none max-w-md w-full p-6 m-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-headline-sm font-headline-sm text-on-background">{title}</h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-secondary">
            ✕
          </button>
        </div>
        <div className="mb-6">
          {children}
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="bg-surface border border-outline-variant text-on-background px-4 py-2 rounded hover:bg-surface-container transition-colors">
            Cancel
          </button>
          <button onClick={onClose} className="bg-primary-container text-on-primary px-4 py-2 rounded hover:bg-on-primary-fixed-variant transition-colors">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}