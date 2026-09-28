/*
  Warnings:

  - Made the column `nameOfLocalGuardian` on table `GuardianInfo` required. This step will fail if there are existing NULL values in that column.
  - Made the column `relationShipOfStudent` on table `GuardianInfo` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "GuardianInfo" ALTER COLUMN "nameOfLocalGuardian" SET NOT NULL,
ALTER COLUMN "relationShipOfStudent" SET NOT NULL;
