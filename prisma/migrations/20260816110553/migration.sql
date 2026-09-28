-- CreateTable
CREATE TABLE "GuardianInfo" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "email" TEXT,
    "fatherName" TEXT NOT NULL,
    "fatherNameBangla" TEXT NOT NULL,
    "whatsappNumber" TEXT NOT NULL,
    "fatherOccupation" TEXT NOT NULL,
    "motherName" TEXT NOT NULL,
    "motherNameBangla" TEXT NOT NULL,
    "motherMobileNumber" TEXT NOT NULL,
    "motherOccupation" TEXT NOT NULL,
    "nameOfLocalGuardian" TEXT NOT NULL,
    "relationShipOfStudent" TEXT NOT NULL,
    "GuardianMobileNumber" TEXT NOT NULL,
    "GuardianSign" TEXT NOT NULL,
    "isdeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "GuardianInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "fullNameBangla" TEXT NOT NULL,
    "dateOfBirth" TEXT NOT NULL,
    "birthRegistrationNumber" TEXT NOT NULL,
    "religion" "Religion" NOT NULL,
    "studentSign" TEXT NOT NULL,
    "admissionTotalFees" TEXT NOT NULL,
    "admissionDate" TEXT NOT NULL,
    "previousInstituteName" TEXT,
    "endingClass" TEXT,
    "result" TEXT,
    "testimonialNumber" TEXT,
    "authoritySign" TEXT NOT NULL,
    "isdeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "guardianInfoId" TEXT NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GuardianInfo_studentId_key" ON "GuardianInfo"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "Student_studentId_key" ON "Student"("studentId");

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuardianInfo" ADD CONSTRAINT "GuardianInfo_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
