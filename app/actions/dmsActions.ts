"use server";

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma/client';
import { getCurrentUserId, requireRole } from '@/lib/supabase/get-current-user-role';

export async function listFolders() {
  try {
    const userId = await getCurrentUserId();
    return await prisma.documentFolder.findMany({
      where: { authorId: userId },
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { documents: true, children: true } },
      },
    });
  } catch (error) {
    console.error('listFolders error:', error);
    return [];
  }
}

export async function createFolder(data: { name: string; parentId?: string | null }) {
  if (!await requireRole('PARTNER', 'ASSOCIATE')) return { success: false as const, error: 'FORBIDDEN', message: 'Forbidden' };
  if (!data.name || !data.name.trim()) return { success: false as const, error: 'VALIDATION', message: 'Folder name is required' };
  try {
    const userId = await getCurrentUserId();
    const folder = await prisma.documentFolder.create({
      data: {
        authorId: userId,
        name: data.name.trim(),
        parentId: data.parentId ?? null,
      },
    });
    revalidatePath('/documents');
    return { success: true as const, folder };
  } catch (error) {
    console.error('createFolder error:', error);
    return { success: false as const, error: 'UNKNOWN', message: 'Failed to create folder' };
  }
}

export async function renameFolder(folderId: string, name: string) {
  if (!await requireRole('PARTNER', 'ASSOCIATE')) return { success: false as const, error: 'FORBIDDEN', message: 'Forbidden' };
  if (!folderId) return { success: false as const, error: 'VALIDATION', message: 'folderId is required' };
  if (!name || !name.trim()) return { success: false as const, error: 'VALIDATION', message: 'Folder name is required' };
  try {
    const userId = await getCurrentUserId();
    const folder = await prisma.documentFolder.findFirst({ where: { id: folderId, authorId: userId } });
    if (!folder) return { success: false as const, error: 'NOT_FOUND', message: 'Folder not found' };
    await prisma.documentFolder.update({
      where: { id: folderId },
      data: { name: name.trim() },
    });
    revalidatePath('/documents');
    return { success: true as const };
  } catch (error) {
    console.error('renameFolder error:', error);
    return { success: false as const, error: 'UNKNOWN', message: 'Failed to rename folder' };
  }
}

export async function deleteFolder(folderId: string) {
  if (!await requireRole('PARTNER', 'ASSOCIATE')) return { success: false as const, error: 'FORBIDDEN', message: 'Forbidden' };
  if (!folderId) return { success: false as const, error: 'VALIDATION', message: 'folderId is required' };
  try {
    const userId = await getCurrentUserId();
    const folder = await prisma.documentFolder.findFirst({ where: { id: folderId, authorId: userId } });
    if (!folder) return { success: false as const, error: 'NOT_FOUND', message: 'Folder not found' };
    await prisma.$transaction([
      prisma.document.updateMany({
        where: { folderId },
        data: { folderId: null },
      }),
      prisma.documentFolder.delete({ where: { id: folderId } }),
    ]);
    revalidatePath('/documents');
    return { success: true as const };
  } catch (error) {
    console.error('deleteFolder error:', error);
    return { success: false as const, error: 'UNKNOWN', message: 'Failed to delete folder' };
  }
}

export async function moveDocumentToFolder(documentId: string, folderId: string | null) {
  if (!documentId) return { success: false as const, error: 'VALIDATION', message: 'documentId is required' };
  try {
    const userId = await getCurrentUserId();
    const doc = await prisma.document.findFirst({ where: { id: documentId, authorId: userId } });
    if (!doc) return { success: false as const, error: 'NOT_FOUND', message: 'Document not found' };
    await prisma.document.update({
      where: { id: documentId },
      data: { folderId },
    });
    revalidatePath('/documents');
    return { success: true as const };
  } catch (error) {
    console.error('moveDocumentToFolder error:', error);
    return { success: false as const, error: 'UNKNOWN', message: 'Failed to move document' };
  }
}

export async function listDocumentsByFolder(folderId: string | null) {
  try {
    const userId = await getCurrentUserId();
    return await prisma.document.findMany({
      where: { folderId, authorId: userId },
      orderBy: { updatedAt: 'desc' },
      include: { headVersion: true, folder: true },
    });
  } catch (error) {
    console.error('listDocumentsByFolder error:', error);
    return [];
  }
}

export async function getDMSData() {
  try {
    const userId = await getCurrentUserId();
    const [folders, rootDocuments] = await Promise.all([
      prisma.documentFolder.findMany({
        where: { authorId: userId },
        orderBy: { name: 'asc' },
        include: { documents: { where: { authorId: userId }, include: { headVersion: true } } },
      }),
      prisma.document.findMany({
        where: { folderId: null, authorId: userId },
        orderBy: { updatedAt: 'desc' },
        include: { headVersion: true },
      }),
    ]);
    return { folders, rootDocuments };
  } catch (error) {
    console.error('getDMSData error:', error);
    return { folders: [], rootDocuments: [] };
  }
}

export async function searchDocuments(query: string) {
  if (!query || !query.trim()) return { documents: [] as never[] };
  try {
    const userId = await getCurrentUserId();
    const documents = await prisma.document.findMany({
      where: {
        authorId: userId,
        OR: [
          { title: { contains: query.trim(), mode: 'insensitive' } },
          { versions: { some: { bodyText: { contains: query.trim(), mode: 'insensitive' } } } },
        ],
      },
      orderBy: { updatedAt: 'desc' },
      include: { headVersion: true, folder: { select: { name: true } } },
      take: 50,
    });
    return { documents };
  } catch (error) {
    console.error('searchDocuments error:', error);
    return { documents: [] };
  }
}