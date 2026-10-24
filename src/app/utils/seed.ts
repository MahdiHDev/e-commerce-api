import { UserRole } from "../../generated/enums";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { envVars } from "../config/env";

export const seedAdmin = async () => {
    try {
        const isAdminExists = await prisma.user.findFirst({
            where: {
                role: UserRole.ADMIN,
            },
        });

        if (isAdminExists) {
            console.log("Admin already exists. Skipping seeding admin.");
            return;
        }

        const adminUser = await auth.api.signUpEmail({
            body: {
                email: envVars.ADMIN_EMAIL,
                password: envVars.ADMIN_PASSWORD,
                name: "Admin",
                role: UserRole.ADMIN,
                needPasswordChange: false,
                rememberMe: false,
            },
        });

        await prisma.user.update({
            where: { id: adminUser.user.id },
            data: {
                emailVerified: true,
            },
        });

        const admin = await prisma.user.findUnique({
            where: {
                id: adminUser.user.id,
            },
        });

        console.log("Admin Created:", admin);
    } catch (error) {
        console.error("Error seeding admin: ", error);
        await prisma.user.delete({
            where: {
                email: envVars.ADMIN_EMAIL,
            },
        });
    }
};
