"use client";

import React, { useState, useMemo } from "react";
import {
  Folder, FileText, ChevronRight, ChevronDown, Plus, Archive, Trash2, Search,
} from "lucide-react";
import type { Folder as FolderType, Document } from "@/lib/types/dms";
import { useDocumentStore } from "@/lib/store/useDocumentStore";

interface DMSSidebarProps {
  folders: FolderType[];
  rootDocs: Document[];
  selectedFolderId: string | null;
  selectedDocs: Set<string>;
  openFolders: Record<string, boolean>;
  newFolderName: string;
  isFolderInputVisible: boolean;
  isDmsOpen: boolean;
  onFolderToggle: (folderId: string) => void;
  onFolderDelete: (folderId: string) => void;
  onNewFolderSubmit: (e: React.FormEvent) => void;
  onNewFolderNameChange: (name: string) => void;
  onFolderInputToggle: () => void;
  onLoadFile: (doc: Document) => void;
  onSelectDoc: (e: React.MouseEvent<HTMLDivElement, MouseEvent> | React.MouseEvent<HTMLInputElement, MouseEvent>, docId: string) => void;
  onBulkArchive: () => void;
  onBulkDelete: () => void;
  onClearSelection: () => void;
  onCreateDocument: () => void;
}

export default function DMSSidebar({
  folders, rootDocs, selectedFolderId, selectedDocs, openFolders,
  newFolderName, isFolderInputVisible, isDmsOpen,
  onFolderToggle, onFolderDelete, onNewFolderSubmit, onNewFolderNameChange,
  onFolderInputToggle, onLoadFile, onSelectDoc,
  onBulkArchive, onBulkDelete, onClearSelection, onCreateDocument,
}: DMSSidebarProps) {
  const docStore = useDocumentStore();
  const [searchQuery, setSearchQuery] = useState('');

  const q = searchQuery.toLowerCase().trim();

  const filteredFolders = useMemo(() => {
    if (!q) return folders;
    return folders.map(f => ({
      ...f,
      documents: f.documents?.filter(d =>
        d.title.toLowerCase().includes(q) ||
        ((d.headVersion as { bodyText?: string | null })?.bodyText ?? '').toLowerCase().includes(q)
      ),
    })).filter(f => f.name.toLowerCase().includes(q) || (f.documents && f.documents.length > 0));
  }, [folders, q]);

  const filteredRootDocs = useMemo(() => {
    if (!q) return rootDocs;
    return rootDocs.filter(d =>
      d.title.toLowerCase().includes(q) ||
      ((d.headVersion as { bodyText?: string | null })?.bodyText ?? '').toLowerCase().includes(q)
    );
  }, [rootDocs, q]);

  return (
    <aside className={`transition-all duration-300 ease-in-out border-r border-outline-variant bg-surface-bright flex flex-col z-10 select-none ${isDmsOpen ? 'w-72 opacity-100' : 'w-0 opacity-0 overflow-hidden border-none'}`}>
      <div className="p-4 border-b border-outline-variant flex items-center justify-between min-w-[18rem]">
        <h2 className="font-headline-sm text-on-surface flex items-center gap-2">
          <Folder className="w-5 h-5 text-secondary" />
          DMS Explorer
        </h2>
        <button
          onClick={onFolderInputToggle}
          className="p-1 hover:bg-surface-container rounded transition-colors text-on-surface"
          title="Create Folder"
        >
          <Plus className="w-4.5 h-4.5" />
        </button>
      </div>

      {isFolderInputVisible && (
        <form onSubmit={onNewFolderSubmit} className="p-3 bg-surface-container border-b border-outline-variant flex gap-2 min-w-[18rem]">
          <input
            type="text"
            placeholder="Folder Name..."
            value={newFolderName}
            onChange={(e) => onNewFolderNameChange(e.target.value)}
            className="w-full text-xs p-1.5 bg-white border border-outline rounded outline-none focus:ring-1 focus:ring-secondary"
            autoFocus
          />
          <button type="submit" className="text-xs bg-secondary text-white px-2 py-1.5 rounded font-semibold hover:bg-opacity-90">Create</button>
        </form>
      )}

      <div className="p-3 min-w-[18rem]">
        <button
          onClick={onCreateDocument}
          className="w-full bg-primary text-white py-2 px-3 rounded-none text-xs font-semibold flex items-center justify-center gap-2 shadow hover:bg-primary-container transition-all"
        >
          <Plus className="w-4 h-4" /> New Document
        </button>
      </div>

      {q && (
        <div className="px-3 pb-2 min-w-[18rem]">
          <p className="text-[11px] text-on-tertiary-container">
            {filteredFolders.reduce((sum, f) => sum + (f.documents?.length || 0), 0) + filteredRootDocs.length} result{q !== '' ? 's' : ''}
          </p>
        </div>
      )}

      <div className="px-3 pb-2 min-w-[18rem]">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-on-tertiary-container" />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search documents..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-surface-container border border-outline-variant outline-none focus:border-secondary transition-colors rounded" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1 min-w-[18rem]">
        {filteredFolders.map((folder) => {
          const isExpanded = openFolders[folder.id];
          return (
            <div key={folder.id} className="space-y-1 group">
              <div className="flex items-center">
                <button
                  onClick={() => onFolderToggle(folder.id)}
                  className={`flex-1 flex items-center gap-2 p-2 rounded text-left text-xs ${selectedFolderId === folder.id ? "bg-surface-container text-on-primary-fixed" : "text-on-surface hover:bg-surface-container-low"}`}
                >
                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  <Folder className="w-4 h-4 text-secondary" />
                  <span className="truncate font-semibold">{folder.name}</span>
                </button>
                <button onClick={() => onFolderDelete(folder.id)} className="opacity-0 group-hover:opacity-100 p-1 text-error hover:bg-error-container rounded transition-opacity" title="Delete Folder">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {isExpanded && (
                <div className="pl-6 space-y-1">
                  {folder.documents?.length === 0 ? (
                    <p className="text-[11px] text-on-tertiary-container italic p-1">No documents</p>
                  ) : (
                    folder.documents?.map((doc: Document) => (
                      <div key={doc.id} className="relative group/doc flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedDocs.has(doc.id)}
                          onChange={() => {
                            // Keyboard-activated: mouse click is handled below
                            onSelectDoc({ stopPropagation: () => {} } as React.MouseEvent<HTMLDivElement, MouseEvent>, doc.id);
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectDoc(e, doc.id);
                          }}
                          className={`absolute left-1 z-10 w-3.5 h-3.5 cursor-pointer accent-secondary ${selectedDocs.has(doc.id) ? 'opacity-100' : 'opacity-0 group-hover/doc:opacity-100'} transition-opacity`}
                        />
                        <button
                          onClick={() => onLoadFile(doc)}
                          className={`w-full flex items-center gap-2 py-1.5 pr-1.5 pl-6 rounded text-left text-xs ${docStore.documentId === doc.id ? "text-secondary font-bold bg-surface-container-low" : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"} transition-colors`}
                        >
                          <FileText className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">{doc.title}</span>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}

        <div className="pt-4 border-t border-outline-variant mt-4">
          <h3 className="text-[11px] font-bold text-on-tertiary-container px-2 mb-2 uppercase tracking-wider">Root Files</h3>
          {filteredRootDocs.map((doc) => (
            <div key={doc.id} className="relative group/doc flex items-center mb-1">
              <input
                type="checkbox"
                checked={selectedDocs.has(doc.id)}
                onChange={() => {
                  onSelectDoc({ stopPropagation: () => {} } as React.MouseEvent<HTMLDivElement, MouseEvent>, doc.id);
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectDoc(e, doc.id);
                }}
                className={`absolute left-2 z-10 w-3.5 h-3.5 cursor-pointer accent-secondary ${selectedDocs.has(doc.id) ? 'opacity-100' : 'opacity-0 group-hover/doc:opacity-100'} transition-opacity`}
              />
              <button
                onClick={() => onLoadFile(doc)}
                className={`w-full flex items-center gap-2 py-2 pr-2 pl-7 rounded text-left text-xs ${docStore.documentId === doc.id ? "text-secondary font-bold bg-surface-container-low" : "text-on-surface hover:bg-surface-container-low"} transition-colors`}
              >
                <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="truncate">{doc.title}</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {selectedDocs.size > 0 && (
        <div className="absolute bottom-0 left-0 right-0 bg-surface-container-high border-t border-outline-variant p-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-20 animate-fade-in-up">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">{selectedDocs.size} Selected</span>
            <button onClick={onClearSelection} className="text-[10px] text-on-surface-variant hover:text-on-surface underline">Clear</button>
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={onBulkArchive}
              className="flex-1 bg-surface-container hover:bg-surface-container-highest border border-outline-variant rounded p-1.5 flex justify-center items-center text-on-surface transition-colors" title="Archive Selected"
            >
              <Archive className="w-4 h-4" />
            </button>
            <button
              onClick={onBulkDelete}
              className="flex-1 bg-error-container hover:bg-[#ffdad6] border border-error/20 rounded p-1.5 flex justify-center items-center text-error transition-colors" title="Delete Selected"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
