import { Router } from "express";
import { UserRole } from "../../../generated/enums";
import { checkAuth } from "../../middleware/auth";
import { AuthController, getMe } from "./auth.controller";

const router: Router = Router();

router.post("/login", AuthController.loginUser);
router.post(
    "/change-password",
    checkAuth(
        UserRole.SUPER_ADMIN,
        UserRole.ADMIN,
        UserRole.ACCOUNTANT,
        UserRole.LIBRARIAN,
        UserRole.STUDENT,
        UserRole.TEACHER,
    ),
    AuthController.changePassword,
);
router.post("/forget-password", AuthController.forgetPassword);
router.post("/reset-password", AuthController.resetPassword);
router.get(
    "/me",
    checkAuth(
        UserRole.SUPER_ADMIN,
        UserRole.ADMIN,
        UserRole.ACCOUNTANT,
        UserRole.LIBRARIAN,
        UserRole.STUDENT,
        UserRole.TEACHER,
        UserRole.OTHER,
    ),
    getMe,
);

export const AuthRoutes = router;
