/*
  Warnings:

  - You are about to drop the column `externalId` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `isDigital` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `unit` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `weight` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "externalId",
DROP COLUMN "isDigital",
DROP COLUMN "unit",
DROP COLUMN "weight",
ALTER COLUMN "isInfiniteStock" SET DEFAULT true;
