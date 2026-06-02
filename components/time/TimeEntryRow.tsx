import React from 'react';

interface TimeEntryRowProps {
  description: string;
  client: string;
  matter: string;
  hours: string;
  date: string;
  onEdit: () => void;
  onDelete: () => void;
}

export default function TimeEntryRow({ description, client, matter, hours, date, onEdit, onDelete }: TimeEntryRowProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-surface-bright border border-outline-variant rounded-none">
      <div className="flex-1">
        <p className="text-on-background font-semibold">{description}</p>
        <p className="text-surface-variant text-sm">{client} - {matter}</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-on-background font-semibold">{hours}</p>
          <p className="text-surface-variant text-sm">{date}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onEdit} className="bg-surface-container text-on-background px-3 py-2 rounded-none hover:bg-surface-container-low">
            Edit
          </button>
          <button onClick={onDelete} className="bg-error text-on-error px-3 py-2 rounded-none hover:bg-error-fixed">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}