/*
  Warnings:

  - You are about to drop the column `GuardianSign` on the `GuardianInfo` table. All the data in the column will be lost.
  - Added the required column `authoritySignPublicId` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `guardianSign` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `picture` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studentSignPublicId` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studentSignType` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studentsignName` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GuardianInfo" DROP COLUMN "GuardianSign";

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "authoritySignName" TEXT,
ADD COLUMN     "authoritySignPublicId" TEXT NOT NULL,
ADD COLUMN     "authoritySignType" TEXT,
ADD COLUMN     "guardianName" TEXT,
ADD COLUMN     "guardianPublicId" TEXT,
ADD COLUMN     "guardianSign" TEXT NOT NULL,
ADD COLUMN     "guardianType" TEXT,
ADD COLUMN     "picture" TEXT NOT NULL,
ADD COLUMN     "pictureName" TEXT,
ADD COLUMN     "picturePublicId" TEXT,
ADD COLUMN     "pictureType" TEXT,
ADD COLUMN     "studentSignPublicId" TEXT NOT NULL,
ADD COLUMN     "studentSignType" TEXT NOT NULL,
ADD COLUMN     "studentsignName" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_classId_fkey" FOREIGN KEY ("classId") REFERENCES "class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
