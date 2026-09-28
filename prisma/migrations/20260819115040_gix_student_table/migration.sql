/*
  Warnings:

  - You are about to drop the column `guardianName` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `guardianPublicId` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `guardianType` on the `Student` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Student" DROP COLUMN "guardianName",
DROP COLUMN "guardianPublicId",
DROP COLUMN "guardianType",
ADD COLUMN     "guardianSignName" TEXT,
ADD COLUMN     "guardianSignPublicId" TEXT,
ADD COLUMN     "guardianSignType" TEXT;
