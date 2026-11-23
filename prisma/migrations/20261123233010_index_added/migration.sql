-- DropIndex
DROP INDEX "Product_status_idx";

-- CreateIndex
CREATE INDEX "Product_status_isDeleted_idx" ON "Product"("status", "isDeleted");
