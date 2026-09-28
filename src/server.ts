import app from "./app";
import { envVars } from "./app/config/env";
import { prisma } from "./app/lib/prisma";
import {
    seedEmployeeSequence,
    seedStudentSequence,
    seedSuperAdmin,
} from "./app/utils/seed";

const bootstrap = async () => {
    try {
        await seedSuperAdmin();
        await seedEmployeeSequence();
        await seedStudentSequence();

        await prisma.$connect();
        app.listen(envVars.PORT, () => {
            console.log(
                `Server is running on http://localhost:${envVars.PORT}`,
            );
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        await prisma.$disconnect();
        process.exit(1);
    }
};

// ✅ Only run server locally

// ✅ Only listen locally — Vercel uses export default
if (process.env.NODE_ENV !== "production") {
    bootstrap();
}
export default app;
