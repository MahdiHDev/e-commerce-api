/*
  Warnings:

  - Added the required column `urlName` to the `ProductImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `urlPublicId` to the `ProductImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `urlType` to the `ProductImage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Brand" ADD COLUMN     "logoUrlName" TEXT,
ADD COLUMN     "logoUrlPublicId" TEXT,
ADD COLUMN     "logoUrlType" TEXT;

-- AlterTable
ALTER TABLE "ProductImage" ADD COLUMN     "urlName" TEXT NOT NULL,
ADD COLUMN     "urlPublicId" TEXT NOT NULL,
ADD COLUMN     "urlType" TEXT NOT NULL;
