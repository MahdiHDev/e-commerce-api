// src/app/config/cloudinary.folders.ts

const ROOT = "spark-ecommerce"; // <-- your project's root folder

export const CloudinaryFolders = {
    brand: {
        brandLogo: `${ROOT}/brand/brandLogo`,
        // authoritySign: `${ROOT}/employees/AuthoritySign`,
        // employeeSign: `${ROOT}/employees/EmoloyeeSign`,
        // experience: `${ROOT}/employees/Experience`,
    },
    student: {
        profile: `${ROOT}/students/profile`,
        studentSign: `${ROOT}/students/studentSign`,
        guardianSign: `${ROOT}/students/guardianSign`,
        authoritySign: `${ROOT}/students/AuthoritySign`,
    },
    // add more as your project grows
} as const;
