-- Create RateCard model
CREATE TABLE IF NOT EXISTS "RateCard" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "clientId" TEXT,
    "matterId" TEXT,
    "rate" DECIMAL(10,2) NOT NULL,
    "label" TEXT,
    "effectiveFrom" TIMESTAMP(3),
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RateCard_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "RateCard_userId_idx" ON "RateCard"("userId");
CREATE INDEX IF NOT EXISTS "RateCard_clientId_idx" ON "RateCard"("clientId");
CREATE INDEX IF NOT EXISTS "RateCard_matterId_idx" ON "RateCard"("matterId");

ALTER TABLE "RateCard" ADD CONSTRAINT "RateCard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RateCard" ADD CONSTRAINT "RateCard_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "RateCard" ADD CONSTRAINT "RateCard_matterId_fkey" FOREIGN KEY ("matterId") REFERENCES "Matter"("id") ON DELETE SET NULL ON UPDATE CASCADE;
