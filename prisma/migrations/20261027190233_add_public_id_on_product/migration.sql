/*
  Warnings:

  - Added the required column `publicId` to the `ProductImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `ProductImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `urlName` to the `ProductImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `ProductVariantImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `publicId` to the `ProductVariantImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `ProductVariantImage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProductImage" ADD COLUMN     "publicId" TEXT NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL,
ADD COLUMN     "urlName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ProductVariantImage" ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "publicId" TEXT NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL;
