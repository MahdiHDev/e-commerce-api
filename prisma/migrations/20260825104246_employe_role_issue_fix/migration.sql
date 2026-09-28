/*
  Warnings:

  - The `employeeRole` column on the `employee` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "employee" DROP COLUMN "employeeRole",
ADD COLUMN     "employeeRole" "UserRole" NOT NULL DEFAULT 'OTHER';
