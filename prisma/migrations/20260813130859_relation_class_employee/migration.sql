/*
  Warnings:

  - You are about to drop the `TutorProfile` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `classTeacher` to the `class` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "TutorProfile" DROP CONSTRAINT "TutorProfile_classId_fkey";

-- DropForeignKey
ALTER TABLE "TutorProfile" DROP CONSTRAINT "TutorProfile_employeeId_fkey";

-- AlterTable
ALTER TABLE "class" ADD COLUMN     "classTeacher" TEXT NOT NULL;

-- DropTable
DROP TABLE "TutorProfile";

-- AddForeignKey
ALTER TABLE "class" ADD CONSTRAINT "class_classTeacher_fkey" FOREIGN KEY ("classTeacher") REFERENCES "employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
