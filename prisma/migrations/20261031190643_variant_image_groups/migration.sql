/*
  Warnings:

  - You are about to drop the `ProductVariantImage` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `attributes` on table `ProductVariant` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "ProductVariantImage" DROP CONSTRAINT "ProductVariantImage_variantId_fkey";

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "imageAttribute" TEXT;

-- AlterTable
ALTER TABLE "ProductImage" ADD COLUMN     "groupValue" TEXT;

-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN     "position" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "attributes" SET NOT NULL,
ALTER COLUMN "attributes" SET DEFAULT '{}';

-- DropTable
DROP TABLE "ProductVariantImage";
