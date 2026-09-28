/*
  Warnings:

  - You are about to drop the column `birthRegistrationNumber` on the `employee` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "employee_birthRegistrationNumber_key";

-- DropIndex
DROP INDEX "employee_nid_key";

-- DropIndex
DROP INDEX "employee_phone_key";

-- AlterTable
ALTER TABLE "employee" DROP COLUMN "birthRegistrationNumber";
