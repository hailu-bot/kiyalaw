"use client";

import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useEditor, BubbleMenu } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Underline } from "@tiptap/extension-underline";
import { TextAlign } from "@tiptap/extension-text-align";
import { Highlight } from "@tiptap/extension-highlight";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { FontFamily } from "@tiptap/extension-font-family";
import { Link } from "@tiptap/extension-link";
import { Image } from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { TaskList } from "@tiptap/extension-task-list";
import { TaskItem } from "@tiptap/extension-task-item";
import { Placeholder } from "@tiptap/extension-placeholder";

// New Extensions
import { Superscript } from "@tiptap/extension-superscript";
import { Subscript } from "@tiptap/extension-subscript";
import { Typography } from "@tiptap/extension-typography";
import { CharacterCount } from "@tiptap/extension-character-count";
import { Dropcursor } from "@tiptap/extension-dropcursor";
import { Gapcursor } from "@tiptap/extension-gapcursor";
import { Focus } from "@tiptap/extension-focus";
import { FileHandler } from "@tiptap/extension-file-handler";

import { PageBreak } from "@/lib/editor/PageBreakExtension";
import { FontSize } from "@/lib/editor/FontSizeExtension";
import { TrailingNode } from "@/lib/editor/TrailingNodeExtension";
import DMSSidebar from "./DMSSidebar";
import DocumentToolbar from "./DocumentToolbar";
import EditorCanvas from "./EditorCanvas";
import AIAssistantPanel from "./AIAssistantPanel";
import DocumentTypeModal from "./DocumentTypeModal";

import { PAGE_CONTENT_HEIGHT, parsePageRanges } from "@/lib/constants";
import { useDocumentStore } from "@/lib/store/useDocumentStore";
import { useToastStore } from "@/lib/store/useToastStore";
import {
  ChevronDown, Save,
  ShieldCheck, Loader2,
  PanelLeftClose, PanelRightClose, PanelLeft, PanelRight, Archive, Trash2, FileDown,
  Bold, Italic, Link as LinkIcon, Highlighter, Search as SearchIcon, FileText,
} from "lucide-react";

import { saveAs } from "file-saver";
import { markdownToHtml, stripHtml } from "@/lib/editor/markdown";

import {
  createDocument,
  saveDocumentVersion,
  updateDocumentStatus,
  deleteDocument,
  bulkUpdateDocumentStatus,
  bulkDeleteDocuments,
  getUniqueDocumentName,
  updateDocumentTitleSafe
} from "@/app/actions/documentActions";
import { moveDocumentToFolder, getDMSData, deleteFolder, searchDocuments } from "@/app/actions/dmsActions";
import { createFolder as createDmsFolder } from "@/app/actions/dmsActions";


import type { Folder as FolderType, Document, DocumentStatus } from "@/lib/types/dms";

interface TipTapWorkspaceProps {
  initialFolders: FolderType[];
  initialRootDocs: Document[];
}

export default function TipTapWorkspace({ initialFolders, initialRootDocs }: TipTapWorkspaceProps) {
  const docStore = useDocumentStore();
  const { addToast } = useToastStore();

  // Layout State
  const [isDmsOpen, setIsDmsOpen] = useState(true);
  const [isAiOpen, setIsAiOpen] = useState(true);

  // DMS State Management
  const [folders, setFolders] = useState<FolderType[]>(initialFolders);
  const [rootDocs, setRootDocs] = useState<Document[]>(initialRootDocs);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [isFolderInputVisible, setIsFolderInputVisible] = useState(false);
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({ "f1": true });
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());

  // AI Assistant Panel State
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiMessages, setAiMessages] = useState<Array<{ sender: "user" | "ai"; text: string; html?: string }>>([
    { sender: "ai", text: "Greetings. I am your AI Writer. Highlight your document contents or type a command below to begin drafting.", html: "<p>Greetings. I am your <strong>AI Writer</strong>. Highlight your document contents or type a command below to begin drafting.</p>" }
  ]);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [docTypeModalOpen, setDocTypeModalOpen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [globalSearchResults, setGlobalSearchResults] = useState<Document[]>([]);
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const globalSearchRef = useRef<HTMLDivElement>(null);
  const globalSearchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleGlobalSearch = useCallback(async (query: string) => {
    setGlobalSearchQuery(query);
    if (globalSearchTimeout.current) clearTimeout(globalSearchTimeout.current);
    if (!query.trim()) {
      setGlobalSearchResults([]);
      setShowGlobalSearch(false);
      return;
    }
    globalSearchTimeout.current = setTimeout(async () => {
      const result = await searchDocuments(query);
      setGlobalSearchResults(result.documents as (Document & { folder?: { name: string } | null })[]);
      setShowGlobalSearch(true);
    }, 300);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (globalSearchRef.current && !globalSearchRef.current.contains(e.target as Node)) {
        setShowGlobalSearch(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const editorWrapperRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // PAGE_CONTENT_HEIGHT is imported from "@/lib/constants"

  // PDF Export Dispatcher
  const handleExportPdf = async () => {
    try {
      const res = await fetch(`/api/documents/${docStore.documentId}/export-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          html: docStore.editorHTML,
          pageStamps: docStore.pageStamps,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || 'PDF export failed');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${docStore.title || 'Document'}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      addToast("PDF Export generated successfully", "success");
    } catch (err) {
      addToast(`Failed to generate PDF export: ${err instanceof Error ? err.message : 'Unknown error'}`, "error");
    }
  };

  // DOCX Export Dispatcher
  const handleExportDocx = async () => {
    try {
      const contentHtml = docStore.editorHTML
        .replace(/<div[^>]*data-type="page-break"[^>]*><\/div>/g, '<br style="page-break-after:always;" clear="all" />')
        .replace(/<hr[^>]*>/g, '<br style="page-break-after:always;" clear="all" />');
      const hasStamp = Object.values(docStore.pageStamps).some(s => s.active);

      let sealHtml = '';
      if (hasStamp) {
        const resp = await fetch('/kiya-stamp.png');
        const blob = await resp.blob();
        const b64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve((reader.result as string)?.split(',')[1] || '');
          reader.readAsDataURL(blob);
        });
        sealHtml = `<img src="data:image/png;base64,${b64}" style="width:160px;height:160px;display:block;margin:24px auto;opacity:0.85;" />`;
      }

      const fullHtml = `<html>
<head><meta charset="utf-8"><title>${docStore.title || 'Document'}</title></head>
<body style="font-family:'Times New Roman',serif;font-size:12pt;line-height:1.5;color:#000;margin:1in;">
${contentHtml}
${sealHtml}
</body></html>`;

      const blob = new Blob([fullHtml], { type: 'application/msword' });
      saveAs(blob, `${docStore.title || 'Document'}.doc`);
      addToast("DOCX Export generated successfully", "success");
    } catch {
      addToast("Failed to generate DOCX export", "error");
    }
  };

  // Re-fetch directory structures
  const updateWorkspaceTree = useCallback(async () => {
    const fresh = await getDMSData();
    setFolders(fresh.folders);
    setRootDocs(fresh.rootDocuments);
  }, []);

  // Toggle dynamic foldering Expand state
  const handleFolderToggle = (folderId: string) => {
    setOpenFolders(prev => ({ ...prev, [folderId]: !prev[folderId] }));
    setSelectedFolderId(folderId);
  };

  // Directory Folder Creation
  const handleNewFolderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    try {
      await createDmsFolder({ name: newFolderName, parentId: selectedFolderId });
      setNewFolderName("");
      setIsFolderInputVisible(false);
      addToast("Folder created successfully", "success");
      updateWorkspaceTree();
    } catch {
      addToast("Failed to write folder", "error");
    }
  };

  const handleFolderDelete = async (folderId: string) => {
    try {
      await deleteFolder(folderId);
      addToast("Folder deleted", "success");
      updateWorkspaceTree();
      if (selectedFolderId === folderId) setSelectedFolderId(null);
    } catch {
      addToast("Failed to delete folder", "error");
    }
  };

  const toggleDocSelection = (e: React.MouseEvent<HTMLDivElement, MouseEvent> | React.MouseEvent<HTMLInputElement, MouseEvent>, docId: string) => {
    e.stopPropagation();
    const newSet = new Set(selectedDocs);
    if (newSet.has(docId)) {
      newSet.delete(docId);
    } else {
      newSet.add(docId);
    }
    setSelectedDocs(newSet);
  };

  // Extract plain text from HTML for auto-naming
  const extractTextFromHtml = (html: string): string => {
    if (!html || html === '<p></p>' || html === '<p><br></p>') return '';
    const div = document.createElement('div');
    div.innerHTML = html;
    const text = div.textContent || div.innerText || '';
    return text.trim().replace(/\s+/g, ' ').slice(0, 50); // First 50 chars
  };

  // Generate auto-title from content
  const generateAutoTitle = (): string => {
    const text = extractTextFromHtml(docStore.editorHTML);
    if (!text) return `Untitled - ${new Date().toLocaleDateString()}`;

    // Take first 5-7 words
    const words = text.split(' ').slice(0, 7).join(' ');
    return `${words}... - ${new Date().toLocaleDateString()}`;
  };

  // Auto-rename document if title is default/untitled
  const autoRenameIfUntitled = async () => {
    if (!docStore.documentId) return;

    const defaultTitles = ['Untitled Document', 'Untitled'];
    const isUntitled = defaultTitles.some(t => docStore.title.startsWith(t)) ||
      docStore.title === '' ||
      docStore.title.startsWith('Legal Draft -');

    if (isUntitled && docStore.editorHTML && docStore.editorHTML !== '<p></p>' && docStore.editorHTML !== '<p><br></p>') {
      const autoTitle = generateAutoTitle();
      try {
        const result = await updateDocumentTitleSafe(docStore.documentId, autoTitle, docStore.folderId);
        if ('wasRenamed' in result && result.wasRenamed) {
          docStore.setTitle(result.title);
          addToast(`Document auto-renamed to: "${result.title}"`, "success");
        }
      } catch {
        // Silently fail - auto-rename is a nice-to-have
      }
    }
  };

  // Document initialiser
  const handleCreateDocument = async () => {
    setDocTypeModalOpen(true);
  };

  const handleCreateDocumentWithType = async (type: string, label: string) => {
    setDocTypeModalOpen(false);
    try {
      const baseTitle = `${label} - ${new Date().toLocaleDateString()}`;
      const uniqueTitle = selectedFolderId
        ? await getUniqueDocumentName(baseTitle, selectedFolderId)
        : baseTitle;

      const result = await createDocument({
        title: uniqueTitle,
        type,
      } as { title: string; type?: string });
      if (!('document' in result) || !result.document) {
        addToast(result.message || "Could not initiate draft", "error");
        return;
      }
      const doc = result.document;
      if (selectedFolderId) {
        await moveDocumentToFolder(doc.id, selectedFolderId);
      }
      docStore.setDocument({
        id: doc.id,
        title: doc.title,
        status: doc.status as DocumentStatus,
        matterId: doc.matterId,
        folderId: doc.folderId,
        bodyHtml: ""
      });
      addToast("Active workspace draft loaded", "success");
      updateWorkspaceTree();
    } catch {
      addToast("Could not initiate draft", "error");
    }
  };

  // Load an existing file
  const handleLoadFile = (doc: Document) => {
    const body = doc.headVersion?.body;
    const bodyHtml = body && typeof body === 'object' && 'bodyHtml' in body
      ? (body as { bodyHtml?: string }).bodyHtml || "<p></p>"
      : "<p></p>";
    docStore.setDocument({
      id: doc.id,
      title: doc.title,
      status: doc.status as DocumentStatus,
      matterId: doc.matterId,
      folderId: doc.folderId,
      bodyHtml
    });
    addToast(`Document loaded: ${doc.title}`, "success");
  };

  // Write manual database checkpoint
  const handleManualSave = useCallback(async () => {
    if (!docStore.documentId) {
      try {
        docStore.setSaving(true);
        const result = await createDocument({
          title: docStore.title
        });
        if (!('document' in result) || !result.document) {
          addToast(result.message || "Error writing new document structure", "error");
          return;
        }
        const doc = result.document;
        if (selectedFolderId) {
          await moveDocumentToFolder(doc.id, selectedFolderId);
        }
        docStore.setDocument({
          id: doc.id,
          title: doc.title,
          status: doc.status as DocumentStatus,
          matterId: doc.matterId,
          folderId: doc.folderId,
          bodyHtml: docStore.editorHTML
        });
        docStore.setLastSaved(new Date());
        addToast("Workspace saved", "success");
        updateWorkspaceTree();
      } finally {
        docStore.setSaving(false);
      }
      return;
    }

    try {
      docStore.setSaving(true);
      const result = await saveDocumentVersion(docStore.documentId, {
        title: docStore.title,
        bodyHtml: docStore.editorHTML
      });
      if (!('version' in result) || !result.version) {
        addToast("Failed to commit version to PostgreSQL", "error");
        return;
      }
      docStore.setDirty(false);
      docStore.setLastSaved(new Date());
      addToast(`Committed saved version ${result.version.versionNumber}`, "success");
      updateWorkspaceTree();
    } finally {
      docStore.setSaving(false);
    }
  }, [docStore, selectedFolderId, updateWorkspaceTree, addToast]);

  // Move Active Document to selected folder
  const handleMoveFile = async (folderId: string | null) => {
    if (!docStore.documentId) return;
    try {
      await moveDocumentToFolder(docStore.documentId, folderId);
      addToast("Document moved successfully", "success");
      updateWorkspaceTree();
    } catch {
      addToast("Failed to move document", "error");
    }
  };

  // Status toggle handler
  const handleStatusUpdate = async (nextStatus: DocumentStatus) => {
    if (!docStore.documentId) return;
    try {
      await updateDocumentStatus(docStore.documentId, nextStatus);
      docStore.setDocument({
        id: docStore.documentId,
        title: docStore.title,
        status: nextStatus,
        matterId: docStore.matterId,
        folderId: docStore.folderId,
        bodyHtml: docStore.editorHTML
      });
      addToast(`Status updated to ${nextStatus}`, "success");
    } catch {
      addToast("Failed to sync status update", "error");
    }
  };

  // Delete current document
  const handleDeleteDocument = async () => {
    if (!docStore.documentId) return;
    if (!confirm("Are you sure you want to permanently delete this document?")) return;
    try {
      await deleteDocument(docStore.documentId);
      addToast("Document deleted permanently", "success");
      docStore.clearDocument();
      updateWorkspaceTree();
    } catch {
      addToast("Failed to delete document", "error");
    }
  };

  // Instantiating the full TipTap editor with all possible open-source free extensions
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Highlight.configure({ multicolor: true }),
      TextStyle,
      Color,
      FontFamily,
      Link.configure({ openOnClick: false }),
      Image,
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({ placeholder: "Write legally binding clauses here..." }),
      Superscript,
      Subscript,
      Typography,
      CharacterCount,
      PageBreak,
      FontSize,
      Focus.configure({ mode: 'shallowest' }),
      FileHandler.configure({
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
        onDrop: (editor, files) => {
          files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
              const url = e.target?.result as string;
              editor.chain().focus().setImage({ src: url }).run();
            };
            reader.readAsDataURL(file);
          });
        },
      }),
      TrailingNode,
      Dropcursor.configure({ color: '#D4AF37', width: 2 }),
      Gapcursor,
    ],
    content: docStore.editorHTML,
    onUpdate: ({ editor }) => {
      docStore.setEditorHTML(editor.getHTML());
    },
  });

  // Re-sync editor content whenever active document shifts
  useEffect(() => {
    if (editor && docStore.editorHTML) {
      if (editor.getHTML() !== docStore.editorHTML) {
        editor.commands.setContent(docStore.editorHTML);
      }
    }
  }, [docStore.documentId, docStore.editorHTML, editor]);

  // Auto-rename when switching to a new document (if current doc is untitled with content)
  useEffect(() => {
    // Trigger auto-rename when document ID changes (switching documents)
    if (docStore.documentId) {
      autoRenameIfUntitled();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docStore.documentId]);

  // Debounced auto save effect (4 seconds)
  useEffect(() => {
    if (!docStore.isDirty || !docStore.documentId) return;
    const saveTimer = setTimeout(() => {
      handleManualSave();
    }, 4000);
    return () => clearTimeout(saveTimer);
  }, [docStore.editorHTML, docStore.title, docStore.isDirty, docStore.documentId, handleManualSave]);

  // ── A4 PAGE PAGINATION: ResizeObserver tracks ProseMirror content height → total pages ──
  useEffect(() => {
    if (!editor) return;
    const editorEl = editor.options.element;
    if (!editorEl) return;
    const observer = new ResizeObserver(() => {
      const contentH = editorEl.scrollHeight;
      const pages = Math.max(1, Math.ceil(contentH / PAGE_CONTENT_HEIGHT));
      if (pages !== docStore.totalPages) {
        docStore.setTotalPages(pages);
      }
    });
    observer.observe(editorEl);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  // ── SCROLL-BASED CURRENT PAGE TRACKING ──
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const currentPage = Math.min(
        docStore.totalPages,
        Math.max(1, Math.floor(scrollTop / PAGE_CONTENT_HEIGHT) + 1)
      );
      if (currentPage !== docStore.currentPage) {
        docStore.setCurrentPage(currentPage);
      }
    };
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docStore.totalPages]);

  // ── COMPUTE PAGE GAP POSITIONS ──
  const pageGaps = useMemo(() => {
    if (docStore.totalPages <= 1) return [];
    return Array.from({ length: docStore.totalPages - 1 }, (_, i) => ({
      topPx: (i + 1) * PAGE_CONTENT_HEIGHT,
      pageAbove: i + 1,
      pageBelow: i + 2,
    }));
  }, [docStore.totalPages]);

  // AI Stream execution
  const handleSendMessageToAI = async () => {
    if (!aiPrompt.trim()) return;
    const userMsg = aiPrompt;
    setAiMessages(prev => [...prev, { sender: "user", text: userMsg }]);
    setAiPrompt("");
    setIsAiProcessing(true);

    const plainText = stripHtml(docStore.editorHTML);

    try {
      const resp = await fetch("/api/ai/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userMsg,
          documentContext: plainText,
          selection: window.getSelection()?.toString() || '',
        })
      });

      if (!resp.ok) throw new Error("Stream connection failed");
      const reader = resp.body?.getReader();
      const decoder = new TextDecoder();
      let streamedResponse = "";
      let htmlResponse = "";

      setAiMessages(prev => [...prev, { sender: "ai", text: "" }]);

      while (reader) {
        const { value, done } = await reader.read();
        if (done) break;

        const rawLine = decoder.decode(value);
        const lines = rawLine.split("\n").filter(l => l.startsWith("data:"));
        for (const line of lines) {
          const payload = line.replace("data:", "").trim();
          if (payload === "[DONE]") break;
          try {
            const parsed = JSON.parse(payload);
            const chunk = typeof parsed === 'string' ? parsed : (parsed.text || '');
            streamedResponse += chunk;
          } catch {
            streamedResponse += payload;
          }
        }

        htmlResponse = markdownToHtml(streamedResponse);
        setAiMessages(prev => {
          const fresh = [...prev];
          fresh[fresh.length - 1] = { sender: "ai", text: streamedResponse, html: htmlResponse };
          return fresh;
        });
      }

      if (editor && htmlResponse) {
        editor.commands.insertContent(
          `<div style="border-left:4px solid #745b00; padding-left:12px; margin: 12px 0; background:#fcf8e3; padding-top:4px; padding-bottom:4px;">${htmlResponse}</div>`
        );
        addToast("AI suggestion loaded into editor.", "success");
      }

    } catch {
      addToast("AI interface failure", "error");
    } finally {
      setIsAiProcessing(false);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">

      <DMSSidebar
        folders={folders}
        rootDocs={rootDocs}
        selectedFolderId={selectedFolderId}
        selectedDocs={selectedDocs}
        openFolders={openFolders}
        newFolderName={newFolderName}
        isFolderInputVisible={isFolderInputVisible}
        isDmsOpen={isDmsOpen}
        onFolderToggle={handleFolderToggle}
        onFolderDelete={handleFolderDelete}
        onNewFolderSubmit={handleNewFolderSubmit}
        onNewFolderNameChange={setNewFolderName}
        onFolderInputToggle={() => setIsFolderInputVisible(!isFolderInputVisible)}
        onLoadFile={handleLoadFile}
        onSelectDoc={toggleDocSelection}
        onBulkArchive={async () => {
          if (confirm(`Archive ${selectedDocs.size} documents?`)) {
            try {
              const result = await bulkUpdateDocumentStatus(Array.from(selectedDocs), "Archived");
              addToast(`Archived ${result.updated} documents`, "success");
              setSelectedDocs(new Set());
              updateWorkspaceTree();
            } catch {
              addToast("Failed to archive documents", "error");
            }
          }
        }}
        onBulkDelete={async () => {
          if (confirm(`Delete ${selectedDocs.size} documents permanently?`)) {
            try {
              const result = await bulkDeleteDocuments(Array.from(selectedDocs));
              addToast(`Deleted ${result.deleted} documents`, "success");
              setSelectedDocs(new Set());
              updateWorkspaceTree();
            } catch {
              addToast("Failed to delete documents", "error");
            }
          }
        }}
        onClearSelection={() => setSelectedDocs(new Set())}
        onCreateDocument={handleCreateDocument}
      />
      <DocumentTypeModal isOpen={docTypeModalOpen} onClose={() => setDocTypeModalOpen(false)} onCreate={handleCreateDocumentWithType} />

      {/* CORE WORKSPACE & WORK AREA */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">

        {/* Dynamic Context Header */}
        <div className="h-16 px-4 border-b border-outline-variant bg-surface flex items-center justify-between select-none">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsDmsOpen(!isDmsOpen)} className="p-2 hover:bg-surface-container rounded-none text-on-surface" title="Toggle Sidebar">
              {isDmsOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeft className="w-5 h-5" />}
            </button>
            <button onClick={() => setIsAiOpen(!isAiOpen)} className="p-2 hover:bg-surface-container rounded-none text-on-surface" title="Toggle AI Assistant">
              {isAiOpen ? <PanelRightClose className="w-5 h-5" /> : <PanelRight className="w-5 h-5" />}
            </button>
            <input
              type="text"
              value={docStore.title}
              onChange={(e) => docStore.setTitle(e.target.value)}
              className="text-lg font-bold text-on-surface bg-transparent border-b border-transparent hover:border-outline focus:border-secondary outline-none px-1 transition-all min-w-[200px]"
              placeholder="Name your file..."
            />
            {docStore.isDirty && <span className="text-xs text-secondary italic">Unsaved changes...</span>}
            {docStore.isSaving && (
              <span className="text-xs text-on-tertiary-container flex items-center gap-1">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Auto-saving
              </span>
            )}
          </div>

          {/* Global Search Bar */}
          <div className="relative flex-1 max-w-md mx-4" ref={globalSearchRef}>
            <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant pointer-events-none" />
            <input
              type="text"
              value={globalSearchQuery}
              onChange={(e) => handleGlobalSearch(e.target.value)}
              onFocus={() => { if (globalSearchResults.length > 0 || globalSearchQuery.trim()) setShowGlobalSearch(true); }}
              placeholder="Search documents..."
              className="w-full pl-8 pr-3 py-1.5 text-sm bg-surface-container border border-outline-variant rounded-none text-on-surface placeholder:text-on-surface-variant outline-none focus:border-secondary transition-colors"
            />
            {showGlobalSearch && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-surface border border-outline-variant shadow-xl z-50 max-h-72 overflow-y-auto">
                {globalSearchResults.length === 0 ? (
                  <div className="px-3 py-4 text-center text-sm text-on-surface-variant">No documents found</div>
                ) : (
                  globalSearchResults.map((doc) => {
                    const d = doc as Document & { folder?: { name: string } | null };
                    return (
                      <button
                        key={d.id}
                        onClick={() => { handleLoadFile(d); setShowGlobalSearch(false); setGlobalSearchQuery(''); }}
                        className="w-full text-left px-3 py-2 text-sm text-on-surface hover:bg-surface-container-hover border-b border-outline-variant last:border-b-0 flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4 shrink-0 text-secondary" />
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-medium">{d.title}</div>
                          {d.folder?.name && <div className="text-xs text-on-surface-variant truncate">{d.folder.name} /</div>}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {docStore.documentId && (
              <>
                <select
                  value={docStore.status}
                  onChange={(e) => handleStatusUpdate(e.target.value as DocumentStatus)}
                  className="bg-white border border-outline text-xs px-2 py-1.5 rounded-none text-on-surface font-semibold focus:outline-none focus:ring-1 focus:ring-secondary"
                >
                  <option value="Draft">Draft</option>
                  <option value="InReview">In Review</option>
                  <option value="Finalized">Finalized</option>
                  <option value="Archived">Archived</option>
                </select>

                <select
                  value={docStore.folderId || ""}
                  onChange={(e) => handleMoveFile(e.target.value || null)}
                  className="bg-white border border-outline text-xs px-2 py-1.5 rounded-none text-on-surface font-semibold focus:outline-none focus:ring-1 focus:ring-secondary"
                >
                  <option value="">Root Directory</option>
                  {folders.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </>
            )}

            <button
              onClick={handleManualSave}
              disabled={docStore.isSaving}
              className="bg-secondary text-white py-1.5 px-3 rounded-none text-xs font-semibold flex items-center gap-2 hover:bg-opacity-95 transition-all shadow-sm cursor-pointer"
            >
              <Save className="w-4 h-4" /> Save
            </button>

            <div className="relative group">
              <button className="bg-primary text-white py-1.5 px-3 rounded-none text-xs font-semibold flex items-center gap-2 hover:bg-opacity-95 transition-all shadow-sm cursor-pointer">
                <FileDown className="w-4 h-4" /> Export
              </button>
              <div className="absolute right-0 top-full mt-1 w-32 bg-surface rounded-none shadow-xl border border-outline-variant opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
                <button onClick={handleExportPdf} className="w-full text-left px-4 py-2 text-xs font-semibold hover:bg-surface-container flex items-center gap-2">
                  PDF (.pdf)
                </button>
                <button onClick={handleExportDocx} className="w-full text-left px-4 py-2 text-xs font-semibold hover:bg-surface-container flex items-center gap-2">
                  Word (.docx)
                </button>
              </div>
            </div>

            <div className="relative group">
              <button
                onClick={() => {
                  const anyActive = Object.values(docStore.pageStamps).some(s => s.active);
                  if (anyActive) docStore.clearAllStamps();
                  else docStore.addStampToAllPages();
                }}
                className={`py-1.5 px-3 rounded-l-lg text-xs font-semibold flex items-center gap-2 transition-all border border-r-0 cursor-pointer ${Object.values(docStore.pageStamps).some(s => s.active) ? "bg-[#ffe089] text-on-secondary-fixed border-secondary shadow-inner" : "bg-white border-outline text-on-surface shadow-sm"}`}
                title="Apply Digital Stamp"
              >
                <ShieldCheck className="w-4 h-4" /> Stamp
              </button>
              <button className={`py-1.5 px-2 rounded-r-lg text-xs font-semibold flex items-center gap-2 transition-all border cursor-pointer ${Object.values(docStore.pageStamps).some(s => s.active) ? "bg-[#ffe089] text-on-secondary-fixed border-secondary shadow-inner" : "bg-white border-outline text-on-surface shadow-sm"}`}>
                <ChevronDown className="w-3 h-3" />
              </button>
              <div className="absolute right-0 top-full mt-1 w-56 bg-surface rounded-none shadow-xl border border-outline-variant opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-visible">
                <button onClick={() => docStore.addStampToAllPages()} className="w-full text-left px-4 py-2 text-xs font-semibold hover:bg-surface-container flex items-center gap-2">
                  All Pages
                </button>
                <button onClick={() => docStore.setPageStamp(docStore.currentPage, { active: true })} className="w-full text-left px-4 py-2 text-xs font-semibold hover:bg-surface-container flex items-center gap-2">
                  Current Page
                </button>
                <div className="border-t border-outline-variant px-3 py-2">
                  <label className="text-[10px] font-bold text-on-tertiary-container uppercase tracking-wider block mb-1">Custom Pages</label>
                  <div className="flex gap-1">
                    <input
                      id="custom-pages-input"
                      type="text"
                      defaultValue=""
                      placeholder="e.g. 1,3,5-7"
                      className="flex-1 text-xs p-1.5 bg-white border border-outline rounded outline-none focus:ring-1 focus:ring-secondary"
                    />
                    <button
                      onClick={() => {
                        const input = document.getElementById('custom-pages-input') as HTMLInputElement;
                        const pages = parsePageRanges(input?.value || '', docStore.totalPages);
                        pages.forEach(p => docStore.setPageStamp(p, { active: true }));
                        addToast(`Stamp added to ${pages.size} page(s)`, "success");
                      }}
                      className="text-xs px-2 py-1 bg-secondary text-on-secondary-fixed rounded font-semibold hover:brightness-110 cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                </div>
                <button onClick={() => docStore.clearAllStamps()} className="w-full text-left px-4 py-2 text-xs font-semibold hover:bg-surface-container flex items-center gap-2 text-error border-t border-outline-variant">
                  Remove All Stamps
                </button>
              </div>
            </div>

            {docStore.documentId && (
              <div className="relative group ml-1">
                <button className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container rounded-none transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="absolute right-0 top-full mt-1 w-40 bg-surface rounded-none shadow-xl border border-outline-variant opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
                  <button onClick={() => handleStatusUpdate("Archived")} className="w-full text-left px-4 py-2 text-xs font-semibold text-on-surface hover:bg-surface-container flex items-center gap-2">
                    <Archive className="w-3.5 h-3.5" /> Archive
                  </button>
                  <button onClick={handleDeleteDocument} className="w-full text-left px-4 py-2 text-xs font-semibold text-error hover:bg-error-container flex items-center gap-2">
                    <Trash2 className="w-3.5 h-3.5" /> Delete Forever
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

        {editor && (
          <>
            <DocumentToolbar editor={editor} isFocused={isFocused} onToggleFocus={() => setIsFocused(v => !v)} />
            {editor && (
              <BubbleMenu editor={editor} tippyOptions={{ duration: 150, placement: 'top' }}
                className="bg-surface shadow-xl border border-outline-variant rounded-none px-2 py-1.5 flex items-center gap-0.5 z-50">
                <button onClick={() => editor.chain().focus().toggleBold().run()} className={`p-1 rounded hover:bg-surface-container cursor-pointer ${editor.isActive("bold") ? "bg-surface-container-highest text-secondary" : "text-on-surface"}`} title="Bold"><Bold className="w-3.5 h-3.5" /></button>
                <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-1 rounded hover:bg-surface-container cursor-pointer ${editor.isActive("italic") ? "bg-surface-container-highest text-secondary" : "text-on-surface"}`} title="Italic"><Italic className="w-3.5 h-3.5" /></button>
                <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={`p-1 rounded hover:bg-surface-container cursor-pointer ${editor.isActive("underline") ? "bg-surface-container-highest text-secondary" : "text-on-surface"}`} title="Underline"><span className="underline text-sm font-bold">U</span></button>
                <span className="w-px h-4 bg-outline-variant mx-0.5" />
                <button onClick={() => { const u = window.prompt('URL'); if (u) editor.chain().focus().setLink({ href: u }).run(); }} className={`p-1 rounded hover:bg-surface-container cursor-pointer ${editor.isActive("link") ? "bg-surface-container-highest text-secondary" : "text-on-surface"}`}><LinkIcon className="w-3.5 h-3.5" /></button>
                <span className="w-px h-4 bg-outline-variant mx-0.5" />
                <button onClick={() => editor.chain().focus().toggleHighlight({ color: "#ffe089" }).run()} className={`p-1 rounded hover:bg-surface-container cursor-pointer ${editor.isActive("highlight") ? "bg-surface-container-highest" : "text-on-surface"}`}><Highlighter className="w-3.5 h-3.5 text-secondary" /></button>
              </BubbleMenu>
            )}
          </>
        )}

        <div className="flex-1 flex overflow-hidden bg-surface-container-low">
          <EditorCanvas
            editor={editor}
            editorWrapperRef={editorWrapperRef}
            isFocused={isFocused}
            scrollContainerRef={scrollContainerRef}
            pageGaps={pageGaps}
            isAiOpen={isAiOpen}
            onToggleAi={() => setIsAiOpen(true)}
          />
          <AIAssistantPanel
            isAiOpen={isAiOpen}
            aiMessages={aiMessages}
            aiPrompt={aiPrompt}
            isAiProcessing={isAiProcessing}
            onToggle={() => setIsAiOpen(!isAiOpen)}
            onPromptChange={setAiPrompt}
            onSend={handleSendMessageToAI}
          />
        </div>
      </main>

    </div>
  );
}