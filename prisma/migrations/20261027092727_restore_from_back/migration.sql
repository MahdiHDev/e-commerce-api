/*
  Warnings:

  - You are about to drop the column `productCode` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `urlName` on the `ProductImage` table. All the data in the column will be lost.
  - You are about to drop the column `urlPublicId` on the `ProductImage` table. All the data in the column will be lost.
  - You are about to drop the column `urlType` on the `ProductImage` table. All the data in the column will be lost.
  - You are about to drop the column `colorId` on the `ProductVariant` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `ProductVariant` table. All the data in the column will be lost.
  - You are about to drop the `ProductColor` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProductColorImage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProductColor" DROP CONSTRAINT "ProductColor_productId_fkey";

-- DropForeignKey
ALTER TABLE "ProductColorImage" DROP CONSTRAINT "ProductColorImage_colorId_fkey";

-- DropForeignKey
ALTER TABLE "ProductVariant" DROP CONSTRAINT "ProductVariant_colorId_fkey";

-- DropIndex
DROP INDEX "Product_productCode_key";

-- DropIndex
DROP INDEX "ProductVariant_colorId_idx";

-- DropIndex
DROP INDEX "ProductVariant_productId_colorId_size_key";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "productCode";

-- AlterTable
ALTER TABLE "ProductImage" DROP COLUMN "urlName",
DROP COLUMN "urlPublicId",
DROP COLUMN "urlType";

-- AlterTable
ALTER TABLE "ProductVariant" DROP COLUMN "colorId",
DROP COLUMN "size",
ADD COLUMN     "attributes" JSONB;

-- DropTable
DROP TABLE "ProductColor";

-- DropTable
DROP TABLE "ProductColorImage";

-- CreateTable
CREATE TABLE "ProductVariantImage" (
    "id" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ProductVariantImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductVariantImage_variantId_idx" ON "ProductVariantImage"("variantId");

-- AddForeignKey
ALTER TABLE "ProductVariantImage" ADD CONSTRAINT "ProductVariantImage_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
