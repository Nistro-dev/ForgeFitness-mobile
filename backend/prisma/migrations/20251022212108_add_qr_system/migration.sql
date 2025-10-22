-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'DISABLED', 'BANNED');

-- CreateEnum
CREATE TYPE "QrValidationResult" AS ENUM ('ALLOW', 'DENY', 'EXPIRED', 'INVALID', 'WRONG_AUDIENCE');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateTable
CREATE TABLE "QrValidationLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "gateId" TEXT NOT NULL,
    "ts" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "result" "QrValidationResult" NOT NULL,
    "method" TEXT NOT NULL DEFAULT 'qr',
    "audInToken" TEXT,
    "kid" TEXT,
    "tokenHash" TEXT,
    "latencyMs" INTEGER,
    "ipAddress" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "QrValidationLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QrValidationLog_gateId_ts_idx" ON "QrValidationLog"("gateId", "ts");

-- CreateIndex
CREATE INDEX "QrValidationLog_userId_ts_idx" ON "QrValidationLog"("userId", "ts");

-- AddForeignKey
ALTER TABLE "QrValidationLog" ADD CONSTRAINT "QrValidationLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
