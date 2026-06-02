-- Add userId to Client (nullable initially to support existing rows)
ALTER TABLE "Client" ADD COLUMN "userId" TEXT;

-- Add userId to Matter
ALTER TABLE "Matter" ADD COLUMN "userId" TEXT;

-- Add userId to Invoice
ALTER TABLE "Invoice" ADD COLUMN "userId" TEXT;

-- Add userId to TimeEntry
ALTER TABLE "TimeEntry" ADD COLUMN "userId" TEXT;

-- Add userId to Activity
ALTER TABLE "Activity" ADD COLUMN "userId" TEXT;

-- Update Document.authorId FK from RESTRICT to CASCADE
ALTER TABLE "Document" DROP CONSTRAINT "Document_authorId_fkey",
  ADD CONSTRAINT "Document_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Update DocumentVersion.authorId FK from RESTRICT to CASCADE
ALTER TABLE "DocumentVersion" DROP CONSTRAINT "DocumentVersion_authorId_fkey",
  ADD CONSTRAINT "DocumentVersion_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create indexes
CREATE INDEX IF NOT EXISTS "Client_userId_idx" ON "Client"("userId");
CREATE INDEX IF NOT EXISTS "Matter_userId_idx" ON "Matter"("userId");
CREATE INDEX IF NOT EXISTS "Invoice_userId_idx" ON "Invoice"("userId");
CREATE INDEX IF NOT EXISTS "TimeEntry_userId_idx" ON "TimeEntry"("userId");
CREATE INDEX IF NOT EXISTS "Activity_userId_idx" ON "Activity"("userId");
CREATE INDEX IF NOT EXISTS "Matter_userId_status_idx" ON "Matter"("userId", "status");
CREATE INDEX IF NOT EXISTS "TimeEntry_matterId_date_idx" ON "TimeEntry"("matterId", "date");
CREATE INDEX IF NOT EXISTS "TimeEntry_userId_date_idx" ON "TimeEntry"("userId", "date");

-- Add foreign key constraints
ALTER TABLE "Client" ADD CONSTRAINT "Client_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Matter" ADD CONSTRAINT "Matter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TimeEntry" ADD CONSTRAINT "TimeEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
