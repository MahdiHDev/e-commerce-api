/*
  Warnings:

  - Made the column `GuardianMobileNumber` on table `GuardianInfo` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "GuardianInfo" ADD COLUMN     "fatherMobileNumber" TEXT,
ALTER COLUMN "motherMobileNumber" DROP NOT NULL,
ALTER COLUMN "GuardianMobileNumber" SET NOT NULL;
