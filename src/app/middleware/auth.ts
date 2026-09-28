// import { NextFunction, Request, Response } from "express";

// export const checkAuth =
//   (...authRoles: string[]) =>
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       //Session Token Verification
//       const sessionToken =
//         req.cookies["__Secure-session_token"] || req.cookies["session_token"];
//       if (!sessionToken) {
//         throw new Error("Unauthorized access! No session token provided.");
//       }

//       // ======================= VERIFY COOKIE =======================

//       // ======================= VERIFY USER ACCESS AND OTHERS =======================

//       // ======================= VERIFY USER ROLE  =======================

//       next();
//     } catch (error: any) {
//       next(error);
//     }
//   };

import { NextFunction, Request, Response } from "express";
import status from "http-status";

import { UserRole } from "../../generated/enums";
import { envVars } from "../config/env";
import AppError from "../errorHelpers/AppError";
import { prisma } from "../lib/prisma";
import { jwtUtils } from "../utils/jwt";

export const checkAuth =
    (...authRoles: UserRole[]) =>
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            let token: string | null = null;

            // Mobile App
            const authHeader = req.headers.authorization;

            if (authHeader?.startsWith("Bearer ")) {
                token = authHeader.split(" ")[1] || null;
            }

            // Web App
            if (!token) {
                token = req.cookies?.accessToken;
            }

            if (!token) {
                throw new AppError(status.UNAUTHORIZED, "Unauthorized access!");
            }

            const verifiedToken = jwtUtils.verifyToken(
                token,
                envVars.ACCESS_TOKEN_SECRET,
            );

            if (!verifiedToken.success) {
                throw new AppError(
                    status.UNAUTHORIZED,
                    "Invalid access token.",
                );
            }

            const user = await prisma.user.findUnique({
                where: {
                    id: verifiedToken.data!.userId,
                },
            });

            if (!user) {
                throw new AppError(status.UNAUTHORIZED, "User not found.");
            }

            if (user.isDeleted) {
                throw new AppError(status.UNAUTHORIZED, "User deleted.");
            }

            if (user.status === "BLOCKED" || user.status === "DELETED") {
                throw new AppError(status.UNAUTHORIZED, "User inactive.");
            }

            if (authRoles.length && !authRoles.includes(user.role)) {
                throw new AppError(status.FORBIDDEN, "Forbidden access.");
            }

            req.user = {
                userId: user.id,
                role: user.role,
                email: user.email,
            };

            next();
        } catch (error) {
            next(error);
        }
    };
