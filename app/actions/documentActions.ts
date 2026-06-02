"use server";

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma/client';
import { DocStatus } from '@prisma/client';
import { getCurrentUserId, requireRole } from '@/lib/supabase/get-current-user-role';

async function ensureUser() {
  const userId = await getCurrentUserId();
  const existing = await prisma.user.findUnique({ where: { id: userId } });
  if (existing) return existing;
  const supabase = await (await import('@/lib/supabase/auth-server')).createAuthServerClient();
  const { data: { user: supaUser } } = await supabase.auth.getUser();
  return prisma.user.create({
    data: {
      id: userId,
      email: supaUser?.email ?? `user-${userId.substring(0, 8)}@kiyalaw.com`,
      name: supaUser?.user_metadata?.full_name ?? 'User',
    },
  });
}

export async function createDocument(data: {
  title: string;
  matterId?: string | null;
  body?: object | null;
}) {
  if (!data.title || !data.title.trim()) {
    return { success: false as const, error: 'VALIDATION', message: 'Document title is required' };
  }

  try {
    const user = await ensureUser();

    const { doc } = await prisma.$transaction(async (tx) => {
      const doc = await tx.document.create({
        data: {
          title: data.title.trim(),
          matterId: data.matterId ?? null,
          authorId: user.id,
          status: 'Draft' as DocStatus,
        },
      });

      if (data.body) {
        const version = await tx.documentVersion.create({
          data: {
            documentId: doc.id,
            authorId: user.id,
            body: data.body,
            versionNumber: 1,
          },
        });

        await tx.document.update({
          where: { id: doc.id },
          data: { headVersionId: version.id },
        });
      }

      return { doc };
    });

    revalidatePath('/documents');
    if (data.matterId) revalidatePath(`/matters/${data.matterId}`);
    return { success: true as const, document: doc };
  } catch (error) {
    console.error('createDocument error:', error);
    return { success: false as const, error: 'UNKNOWN', message: 'Failed to create document' };
  }
}

export async function getDocument(documentId: string) {
  if (!documentId) return null;
  const userId = await getCurrentUserId();
  try {
    const doc = await prisma.document.findFirst({
      where: { id: documentId, authorId: userId },
      include: { headVersion: true },
    });
    return doc;
  } catch (error) {
    console.error('getDocument error:', error);
    return null;
  }
}

export async function listDocuments() {
  const userId = await getCurrentUserId();
  try {
    const docs = await prisma.document.findMany({
      where: { authorId: userId },
      orderBy: { updatedAt: 'desc' },
      include: { headVersion: true },
    });
    return docs;
  } catch (error) {
    console.error('listDocuments error:', error);
    return [];
  }
}

export async function saveDocumentVersion(documentId: string, body: object) {
  if (!documentId) {
    return { success: false as const, error: 'VALIDATION', message: 'documentId is required' };
  }

  try {
    const user = await ensureUser();

    const { version } = await prisma.$transaction(async (tx) => {
      const currentDoc = await tx.document.findUnique({
        where: { id: documentId },
        select: { id: true },
      });
      if (!currentDoc) throw new Error('Document not found');

      const latestVersion = await tx.documentVersion.findFirst({
        where: { documentId },
        orderBy: { versionNumber: 'desc' },
        select: { versionNumber: true },
      });

      const nextNumber = (latestVersion?.versionNumber ?? 0) + 1;

      const version = await tx.documentVersion.create({
        data: {
          documentId,
          authorId: user.id,
          body,
          versionNumber: nextNumber,
        },
      });

      await tx.document.update({
        where: { id: documentId },
        data: { headVersionId: version.id },
      });

      return { version };
    });

    return { success: true as const, version };
  } catch (error) {
    console.error('saveDocumentVersion error:', error);
    if (error instanceof Error && error.message === 'Document not found') {
      return { success: false as const, error: 'NOT_FOUND', message: 'Document not found' };
    }
    return { success: false as const, error: 'UNKNOWN', message: 'Failed to save document version' };
  }
}

export async function updateDocumentTitle(documentId: string, title: string) {
  if (!documentId) return { success: false as const, error: 'VALIDATION', message: 'documentId is required' };
  if (!title || !title.trim()) return { success: false as const, error: 'VALIDATION', message: 'Document title is required' };
  if (!await requireRole('PARTNER', 'ASSOCIATE')) return { success: false as const, error: 'FORBIDDEN', message: 'Forbidden' };
  const userId = await getCurrentUserId();
  try {
    const doc = await prisma.document.findFirst({ where: { id: documentId, authorId: userId } });
    if (!doc) return { success: false as const, error: 'NOT_FOUND', message: 'Document not found' };
    await prisma.document.update({
      where: { id: documentId },
      data: { title: title.trim() },
    });
    revalidatePath('/documents');
    return { success: true as const };
  } catch (error) {
    console.error('updateDocumentTitle error:', error);
    return { success: false as const, error: 'UNKNOWN', message: 'Failed to update document title' };
  }
}

export async function updateDocumentStatus(documentId: string, status: DocStatus) {
  if (!documentId) return { success: false as const, error: 'VALIDATION', message: 'documentId is required' };
  const validStatuses: DocStatus[] = ['Draft', 'InReview', 'Finalized', 'Archived'];
  if (!validStatuses.includes(status)) return { success: false as const, error: 'VALIDATION', message: `Invalid status: ${status}` };
  if (!await requireRole('PARTNER', 'ASSOCIATE')) return { success: false as const, error: 'FORBIDDEN', message: 'Forbidden' };
  const userId = await getCurrentUserId();
  try {
    const doc = await prisma.document.findFirst({ where: { id: documentId, authorId: userId } });
    if (!doc) return { success: false as const, error: 'NOT_FOUND', message: 'Document not found' };
    await prisma.document.update({
      where: { id: documentId },
      data: { status },
    });
    revalidatePath('/documents');
    return { success: true as const };
  } catch (error) {
    console.error('updateDocumentStatus error:', error);
    return { success: false as const, error: 'UNKNOWN', message: 'Failed to update document status' };
  }
}

export async function deleteDocument(documentId: string) {
  if (!documentId) return { success: false as const, error: 'VALIDATION', message: 'documentId is required' };
  if (!await requireRole('PARTNER', 'ASSOCIATE')) return { success: false as const, error: 'FORBIDDEN', message: 'Forbidden' };
  try {
    const userId = await getCurrentUserId();
    const doc = await prisma.document.findFirst({ where: { id: documentId, authorId: userId } });
    if (!doc) return { success: false as const, error: 'NOT_FOUND', message: 'Document not found' };
    await prisma.$transaction(async (tx) => {
      await tx.documentVersion.deleteMany({ where: { documentId } });
      await tx.document.delete({ where: { id: documentId } });
    });
    revalidatePath('/documents');
    return { success: true as const };
  } catch (error) {
    console.error('deleteDocument error:', error);
    return { success: false as const, error: 'UNKNOWN', message: 'Failed to delete document' };
  }
}

export async function getUniqueDocumentName(title: string, folderId: string | null, excludeDocId?: string): Promise<string> {
  try {
    const userId = await getCurrentUserId();
    const existingDocs = await prisma.document.findMany({
      where: {
        authorId: userId,
        folderId: folderId,
        ...(excludeDocId && { id: { not: excludeDocId } }),
      },
      select: { title: true },
    });

    const existingTitles = new Set(existingDocs.map(d => d.title));

    if (!existingTitles.has(title)) {
      return title;
    }

    let suffix = 1;
    let newName = `${title} (${suffix})`;
    while (existingTitles.has(newName)) {
      suffix++;
      newName = `${title} (${suffix})`;
    }

    return newName;
  } catch (error) {
    console.error('getUniqueDocumentName error:', error);
    return title;
  }
}

export async function bulkUpdateDocumentStatus(documentIds: string[], status: DocStatus) {
  if (!await requireRole('PARTNER', 'ASSOCIATE')) return { success: false as const, error: 'FORBIDDEN', message: 'Forbidden', updated: 0 };
  if (!documentIds.length) return { success: true as const, updated: 0 };
  try {
    const userId = await getCurrentUserId();

    await prisma.document.updateMany({
      where: { id: { in: documentIds }, authorId: userId },
      data: { status },
    });

    revalidatePath('/documents');
    return { success: true as const, updated: documentIds.length };
  } catch (error) {
    console.error('bulkUpdateDocumentStatus error:', error);
    return { success: false as const, error: 'UNKNOWN', message: 'Failed to update documents', updated: 0 };
  }
}

export async function bulkDeleteDocuments(documentIds: string[]) {
  if (!await requireRole('PARTNER', 'ASSOCIATE')) return { success: false as const, error: 'FORBIDDEN', message: 'Forbidden', deleted: 0 };
  if (!documentIds.length) return { success: true as const, deleted: 0 };
  try {
    const userId = await getCurrentUserId();

    await prisma.$transaction(async (tx) => {
      await tx.documentVersion.deleteMany({
        where: { documentId: { in: documentIds }, document: { authorId: userId } },
      });

      await tx.document.deleteMany({
        where: { id: { in: documentIds }, authorId: userId },
      });
    });

    revalidatePath('/documents');
    return { success: true as const, deleted: documentIds.length };
  } catch (error) {
    console.error('bulkDeleteDocuments error:', error);
    return { success: false as const, error: 'UNKNOWN', message: 'Failed to delete documents', deleted: 0 };
  }
}

export async function bulkMoveDocuments(documentIds: string[], folderId: string | null) {
  if (!await requireRole('PARTNER', 'ASSOCIATE')) return { success: false as const, error: 'FORBIDDEN', message: 'Forbidden', moved: 0 };
  if (!documentIds.length) return { success: true as const, moved: 0 };
  try {
    const userId = await getCurrentUserId();

    await prisma.document.updateMany({
      where: { id: { in: documentIds }, authorId: userId },
      data: { folderId },
    });

    revalidatePath('/documents');
    return { success: true as const, moved: documentIds.length };
  } catch (error) {
    console.error('bulkMoveDocuments error:', error);
    return { success: false as const, error: 'UNKNOWN', message: 'Failed to move documents', moved: 0 };
  }
}

export async function updateDocumentTitleSafe(documentId: string, title: string, folderId: string | null): Promise<{ success: boolean; title: string; wasRenamed: boolean } | { success: false; error: string; message: string }> {
  if (!documentId) return { success: false as const, error: 'VALIDATION', message: 'documentId is required' as string };
  if (!title || !title.trim()) return { success: false as const, error: 'VALIDATION', message: 'Document title is required' as string };
  if (!await requireRole('PARTNER', 'ASSOCIATE')) return { success: false as const, error: 'FORBIDDEN', message: 'Forbidden' };
  try {
    const userId = await getCurrentUserId();
    const uniqueTitle = await getUniqueDocumentName(title, folderId, documentId);
    const doc = await prisma.document.findFirst({ where: { id: documentId, authorId: userId } });
    if (!doc) return { success: false as const, error: 'NOT_FOUND', message: 'Document not found' as string };

    await prisma.document.update({
      where: { id: documentId },
      data: { title: uniqueTitle },
    });

    revalidatePath('/documents');
    return {
      success: true as const,
      title: uniqueTitle,
      wasRenamed: uniqueTitle !== title
    };
  } catch (error) {
    console.error('updateDocumentTitleSafe error:', error);
    return { success: false as const, error: 'UNKNOWN', message: 'Failed to update document title' as string };
  }
}