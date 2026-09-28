/*
  Warnings:

  - You are about to drop the column `email` on the `GuardianInfo` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[birthRegistrationNumber]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - Made the column `motherMobileNumber` on table `GuardianInfo` required. This step will fail if there are existing NULL values in that column.
  - Made the column `fatherMobileNumber` on table `GuardianInfo` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `gender` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GuardianInfo" DROP COLUMN "email",
ALTER COLUMN "motherMobileNumber" SET NOT NULL,
ALTER COLUMN "fatherMobileNumber" SET NOT NULL;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "bloodGroup" "BloodGroup",
ADD COLUMN     "gender" "Gender" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Student_birthRegistrationNumber_key" ON "Student"("birthRegistrationNumber");
