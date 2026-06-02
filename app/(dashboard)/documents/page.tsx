import React from "react";
import { prisma } from "@/lib/prisma/client";
import { getCurrentUserId } from "@/lib/supabase/get-current-user";
import TipTapWorkspace from "@/components/document/TipTapWorkspace";
import { getDMSData } from "@/app/actions/dmsActions";
import type { Document as DocType, Folder as FolderType } from "@/lib/types/dms";

export default async function DocumentsPage({ searchParams }: { searchParams: Promise<{ clientId?: string }> }) {
  const { clientId } = await searchParams;
  let folders: FolderType[] = [];
  let rootDocuments: DocType[] = [];

  try {
    const userId = await getCurrentUserId();
    const data = await getDMSData();
    let docs = data.rootDocuments as DocType[];
    let folderList = data.folders as FolderType[];

    if (clientId) {
      const matterIds = await prisma.matter.findMany({
        where: { clientId, userId },
        select: { id: true },
      });
      const ids = new Set(matterIds.map(m => m.id));
      docs = docs.filter(d => d.matterId && ids.has(d.matterId));
      folderList = folderList.map(f => ({
        ...f,
        documents: (f.documents ?? []).filter(d => d.matterId && ids.has(d.matterId)),
      }));
    }

    folders = folderList;
    rootDocuments = docs;
  } catch (e) {
    console.error("DocumentsPage: Failed to load DMS data, using empty defaults", e);
  }

  return (
    <TipTapWorkspace 
      initialFolders={folders} 
      initialRootDocs={rootDocuments} 
    />
  );
}