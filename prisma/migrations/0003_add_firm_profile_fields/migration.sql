-- Create FirmProfile table if it does not exist (was missing from baseline migration)
CREATE TABLE IF NOT EXISTS "FirmProfile" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "firmName" TEXT NOT NULL DEFAULT 'Kiya Law',
    "defaultRate" INTEGER NOT NULL DEFAULT 350,
    "logoUrl" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'America/New_York',
    "dateFormat" TEXT NOT NULL DEFAULT 'MM/DD/YYYY',
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "billingAlerts" BOOLEAN NOT NULL DEFAULT true,
    "automationSettings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "FirmProfile_pkey" PRIMARY KEY ("id")
);

-- Add contact fields to FirmProfile
ALTER TABLE "FirmProfile" ADD COLUMN IF NOT EXISTS "address" TEXT;
ALTER TABLE "FirmProfile" ADD COLUMN IF NOT EXISTS "phone" TEXT;
ALTER TABLE "FirmProfile" ADD COLUMN IF NOT EXISTS "email" TEXT;
ALTER TABLE "FirmProfile" ADD COLUMN IF NOT EXISTS "website" TEXT;
