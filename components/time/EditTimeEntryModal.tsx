import React from 'react';

import type { TimeEntry } from '../../lib/types';

interface EditTimeEntryModalProps {
  open: boolean;
  onClose: () => void;
  timeEntry: TimeEntry;
  onSave: (timeEntry: TimeEntry) => void;
}

export default function EditTimeEntryModal({ open, onClose, timeEntry, onSave }: EditTimeEntryModalProps) {
  const [entry, setEntry] = React.useState(timeEntry);

  if (!open) {
    return null;
  }


  const handleChange = (field: keyof typeof entry, value: string) => {
    setEntry({ ...entry, [field]: value });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-surface border border-outline-variant rounded-none-lg max-w-md w-full p-6 m-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-headline-sm font-headline-sm text-on-background">Edit Time Entry</h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-secondary">
            ✕
          </button>
        </div>
        
        <div className="space-y-4 mb-6">
          <div>
            <label className="text-label-sm font-label-sm text-on-surface-variant block mb-2">Description</label>
            <input
              type="text"
              value={entry.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full bg-surface-container border border-outline-variant rounded-none px-4 py-2 text-on-background"
            />
          </div>
          
          <div>
            <label className="text-label-sm font-label-sm text-on-surface-variant block mb-2">Client</label>
            <select
              value={entry.client}
              onChange={(e) => handleChange('client', e.target.value)}
              className="w-full bg-surface-container border border-outline-variant rounded-none px-4 py-2 text-on-background"
            >
              <option>Stark Industries</option>
              <option>Wayne Enterprises</option>
              <option>LexCorp</option>
            </select>
          </div>
          
          <div>
            <label className="text-label-sm font-label-sm text-on-surface-variant block mb-2">Matter</label>
            <select
              value={entry.matter}
              onChange={(e) => handleChange('matter', e.target.value)}
              className="w-full bg-surface-container border border-outline-variant rounded-none px-4 py-2 text-on-background"
            >
              <option>Corporate Restructuring</option>
              <option>Merger Acquisition</option>
              <option>IP Litigation</option>
            </select>
          </div>
          
          <div>
            <label className="text-label-sm font-label-sm text-on-surface-variant block mb-2">Hours</label>
            <input
              type="number"
              step="0.1"
              value={entry.hours}
              onChange={(e) => handleChange('hours', e.target.value)}
              className="w-full bg-surface-container border border-outline-variant rounded-none px-4 py-2 text-on-background"
            />
          </div>
          
          <div>
            <label className="text-label-sm font-label-sm text-on-surface-variant block mb-2">Date</label>
            <input
              type="date"
              value={entry.date}
              onChange={(e) => handleChange('date', e.target.value)}
              className="w-full bg-surface-container border border-outline-variant rounded-none px-4 py-2 text-on-background"
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="bg-surface border border-outline-variant text-on-background px-4 py-2 rounded-none hover:bg-surface-container transition-colors">
            Cancel
          </button>
          <button onClick={() => onSave(entry)} className="bg-primary-container text-on-primary px-4 py-2 rounded-none hover:bg-on-primary-fixed-variant transition-colors">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}