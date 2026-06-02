/**
 * Reset database — removes all user-owned data for a clean production launch.
 * Run: npx tsx scripts/reset-db.ts
 *
 * WARNING: This destroys ALL data. Use only before production launch.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Resetting database...');

  // Order matters to respect foreign key constraints
  await prisma.documentShare.deleteMany();
  await prisma.imageAsset.deleteMany();
  await prisma.documentVersion.deleteMany();
  await prisma.document.deleteMany();
  await prisma.documentFolder.deleteMany();
  await prisma.invoiceApproval.deleteMany();
  await prisma.invoiceLineItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.timeEntry.deleteMany();
  await prisma.matter.deleteMany();
  await prisma.clientDocument.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();

  // Preserve templates and firm profile
  await prisma.firmProfile.deleteMany();
  await prisma.firmProfile.create({ data: {} });

  console.log('Database reset complete. All user data has been removed.');
  console.log('FirmProfile has been reset to defaults.');
  console.log('Note: DocumentTemplate records are preserved.');
}

main()
  .catch((e) => {
    console.error('Reset failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
