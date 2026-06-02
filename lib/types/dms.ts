

export interface DocumentVersion {
  id: string;
  documentId: string;
  authorId: string;
  body: unknown;
  versionNumber: number;
  changeNote?: string | null;
  createdAt: Date;
}

export type DocumentStatus = "Draft" | "InReview" | "Finalized" | "Archived";

export interface Document {
  id: string;
  title: string;
  status: DocumentStatus;
  matterId: string | null;
  folderId: string | null;
  authorId: string;
  headVersionId: string | null;
  headVersion?: DocumentVersion | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  documents?: Document[];
  createdAt: Date;
  updatedAt: Date;
}
