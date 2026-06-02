import { create } from "zustand";

export interface PageStampConfig {
  active: boolean;
  right: number;
  bottom: number;
}

interface DocumentState {
  // Active document attributes
  documentId: string | null;
  title: string;
  status: "Draft" | "InReview" | "Finalized" | "Archived";
  matterId: string | null;
  folderId: string | null;
  
  // Editor synchronization states
  editorJSON: string;
  editorHTML: string;
  isDirty: boolean;
  isSaving: boolean;
  lastSavedAt: Date | null;
  
  // Per-page stamps
  pageStamps: Record<number, PageStampConfig>;
  totalPages: number;
  currentPage: number;

  // Global modifiers
  setDocument: (doc: {
    id: string;
    title: string;
    status: "Draft" | "InReview" | "Finalized" | "Archived";
    matterId: string | null;
    folderId: string | null;
    bodyHtml?: string;
  }) => void;
  resetDocument: () => void;
  clearDocument: () => void;
  setEditorHTML: (html: string) => void;
  setEditorJSON: (jsonStr: string) => void;
  setTitle: (title: string) => void;
  setDirty: (isDirty: boolean) => void;
  setSaving: (isSaving: boolean) => void;
  setLastSaved: (date: Date) => void;
  setPageStamp: (page: number, config: Partial<PageStampConfig>) => void;
  removePageStamp: (page: number) => void;
  addStampToAllPages: (totalPages?: number) => void;
  clearAllStamps: () => void;
  setTotalPages: (pages: number) => void;
  setCurrentPage: (page: number) => void;
}

const DEFAULT_STAMP: PageStampConfig = { active: true, right: 40, bottom: 112 };

export const useDocumentStore = create<DocumentState>((set) => ({
  documentId: null,
  title: "Untitled Document",
  status: "Draft",
  matterId: null,
  folderId: null,
  
  editorJSON: "",
  editorHTML: "<p><br></p>",
  isDirty: false,
  isSaving: false,
  lastSavedAt: null,
  
  pageStamps: {},
  totalPages: 1,
  currentPage: 1,

  setDocument: (doc) => set(() => ({
    documentId: doc.id,
    title: doc.title,
    status: doc.status,
    matterId: doc.matterId,
    folderId: doc.folderId,
    editorHTML: doc.bodyHtml || "<p></p>",
    isDirty: false,
  })),

  resetDocument: () => set({
    documentId: null,
    title: "Untitled Document",
    status: "Draft",
    matterId: null,
    folderId: null,
    editorHTML: "<p></p>",
    editorJSON: "",
    isDirty: false,
    pageStamps: {},
    totalPages: 1,
    currentPage: 1,
  }),

  clearDocument: () => set({
    documentId: null,
    title: "Untitled Document",
    status: "Draft",
    matterId: null,
    folderId: null,
    editorHTML: "<p></p>",
    editorJSON: "",
    isDirty: false,
    pageStamps: {},
    totalPages: 1,
    currentPage: 1,
  }),

  setEditorHTML: (html) => set((state) => ({ 
    editorHTML: html, 
    isDirty: state.documentId ? true : false 
  })),

  setEditorJSON: (jsonStr) => set(() => ({
    editorJSON: jsonStr
  })),

  setTitle: (title) => set((state) => ({ 
    title, 
    isDirty: state.documentId ? true : false
  })),

  setDirty: (isDirty) => set({ isDirty }),
  setSaving: (isSaving) => set({ isSaving }),
  setLastSaved: (lastSavedAt) => set({ lastSavedAt }),

  setPageStamp: (page, config) => set((state) => ({
    pageStamps: {
      ...state.pageStamps,
      [page]: { ...(state.pageStamps[page] || DEFAULT_STAMP), ...config },
    },
  })),

  removePageStamp: (page) => set((state) => {
    const rest: Record<number, PageStampConfig> = {};
    for (const key of Object.keys(state.pageStamps)) {
      const k = Number(key);
      if (k !== page) rest[k] = state.pageStamps[k];
    }
    return { pageStamps: rest };
  }),

  addStampToAllPages: (totalPages) => set((state) => {
    const pages = totalPages ?? state.totalPages;
    const stamps: Record<number, PageStampConfig> = {};
    for (let i = 0; i < pages; i++) {
      stamps[i] = { ...DEFAULT_STAMP, active: true };
    }
    return { pageStamps: { ...state.pageStamps, ...stamps } };
  }),

  clearAllStamps: () => set({ pageStamps: {} }),

  setTotalPages: (totalPages) => set({ totalPages }),
  setCurrentPage: (currentPage) => set({ currentPage }),
}));
