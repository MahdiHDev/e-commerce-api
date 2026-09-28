import { UserRole } from "../../generated/enums";
import { envVars } from "../config/env";
import { auth } from "../lib/auth";
import { prisma } from "../lib/prisma";

export const seedSuperAdmin = async () => {
    try {
        const isSuperAdminExists = await prisma.user.findFirst({
            where: {
                role: UserRole.SUPER_ADMIN,
            },
        });

        if (isSuperAdminExists) {
            console.log(
                "Super admin already exists. Skipping seeding super admin.",
            );
            return;
        }

        const superAdminUser = await auth.api.signUpEmail({
            body: {
                email: envVars.SUPER_ADMIN_EMAIL,
                password: envVars.SUPER_ADMIN_PASSWORD,
                name: "Super Admin",
                role: UserRole.SUPER_ADMIN,
                needPasswordChange: false,
                rememberMe: false,
            },
        });

        await prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { id: superAdminUser.user.id },
                data: {
                    emailVerified: true,
                },
            });

            await tx.admin.create({
                data: {
                    userId: superAdminUser.user.id,
                    name: "Super Admin",
                    email: envVars.SUPER_ADMIN_EMAIL,
                },
            });
        });

        const superAdmin = await prisma.admin.findFirst({
            where: {
                email: envVars.SUPER_ADMIN_EMAIL,
            },
            include: {
                user: true,
            },
        });

        console.log("Super Admin Created", superAdmin);
    } catch (error) {
        console.error("Error seeding super admin: ", error);
        await prisma.user.delete({
            where: {
                email: envVars.SUPER_ADMIN_EMAIL,
            },
        });
    }
};

export const seedEmployeeSequence = async () => {
    try {
        const sequenceExists = await prisma.sequence.findUnique({
            where: {
                id: "employee",
            },
        });

        if (sequenceExists) {
            console.log("Employee sequence already exists. Skipping seed.");
            return;
        }

        await prisma.sequence.create({
            data: {
                id: "employee",
                current: 999,
            },
        });

        console.log("Employee sequence seeded successfully");
    } catch (error) {
        console.error("Error seeding employee sequence:", error);
    }
};

export const seedStudentSequence = async () => {
    try {
        const sequenceExists = await prisma.sequence.findUnique({
            where: {
                id: "student",
            },
        });

        if (sequenceExists) {
            console.log("Student sequence already exists. Skipping seed.");
            return;
        }

        await prisma.sequence.create({
            data: {
                id: "student",
                current: 999,
            },
        });

        console.log("Student sequence seeded successfully");
    } catch (error) {
        console.error("Error seeding Student sequence:", error);
    }
};
