import { Router } from "express";
import { UserRole } from "../../../generated/enums";
import { checkAuth } from "../../middleware/auth";
import { AuthController, getMe } from "./auth.controller";

const router: Router = Router();

router.post("/register", AuthController.registerUser);
router.post("/login", AuthController.loginUser);
router.get(
    "/me",
    checkAuth(UserRole.ADMIN, UserRole.USER, UserRole.MODERATOR),
    getMe,
);
router.post(
    "/change-password",
    checkAuth(UserRole.ADMIN, UserRole.USER, UserRole.MODERATOR),
    AuthController.changePassword,
);
router.post("/verify-email", AuthController.verifyEmail);
router.post("/forget-password", AuthController.forgetPassword);
router.post("/reset-password", AuthController.resetPassword);

export const AuthRoutes = router;
