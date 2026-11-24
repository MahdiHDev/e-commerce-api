/*
  Warnings:

  - A unique constraint covering the columns `[productId,sku]` on the table `ProductVariant` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "ProductVariant_sku_key";

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_productId_sku_key" ON "ProductVariant"("productId", "sku");
