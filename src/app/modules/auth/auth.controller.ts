import { Request, Response } from "express";
import status from "http-status";
import { auth } from "../../../lib/auth";
import { envVars } from "../../config/env";
import AppError from "../../errorHelpers/AppError";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { CookieUtils } from "../../utils/cookie";
import { tokenUtils } from "../../utils/token";
import { AuthService } from "./auth.service";

const registerUser = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    const result = await AuthService.registerUser(payload);

    sendResponse(res, {
        httpStatusCode: status.CREATED,
        success: true,
        message: "User registered successfully",
        data: result,
    });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    const result = await AuthService.loginUser(payload);
    const { accessToken, refreshToken, token, ...rest } = result;

    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setRefreshTokenCookie(res, refreshToken);
    tokenUtils.setBetterAuthSessionCookie(res, token);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "User Logged in successfully",
        data: {
            token,
            accessToken,
            refreshToken,
            ...rest,
        },
    });
});

const verifyEmail = catchAsync(async (req: Request, res: Response) => {
    const { email, otp } = req.body;
    await AuthService.verifyEmail(email, otp);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Email verified successfully",
    });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;

    // web: from cookie | Mobile: from Authorization header or body
    const betterAuthSessionToken =
        req.cookies["__Secure-better-auth.session_token"] ||
        req.cookies["better-auth.session_token"] ||
        (req.headers["x-session-token"] as string) || // ✅ mobile sends this
        payload.sessionToken || // ✅ or in body
        null;

    if (!betterAuthSessionToken) {
        throw new AppError(status.UNAUTHORIZED, "No session token found");
    }

    // remove sessionToken from payload before passing to service
    const { sessionToken: _, ...cleanPayload } = payload;

    const result = await AuthService.changePassword(
        cleanPayload,
        betterAuthSessionToken,
    );

    const { accessToken, refreshToken, token } = result;

    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setRefreshTokenCookie(res, refreshToken);
    tokenUtils.setBetterAuthSessionCookie(res, token as string);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Password changed successfully",
        data: result,
    });
});

const logoutUser = catchAsync(async (req: Request, res: Response) => {
    const betterAuthSessionToken = req.cookies["better-auth.session_token"];
    const result = await AuthService.logoutUser(betterAuthSessionToken);
    CookieUtils.clearCookie(res, "accessToken", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
    });
    CookieUtils.clearCookie(res, "refreshToken", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
    });
    CookieUtils.clearCookie(res, "better-auth.session_token", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
    });

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "User logged out successfully",
        data: result,
    });
});

const forgetPassword = catchAsync(async (req: Request, res: Response) => {
    const { email } = req.body;
    await AuthService.forgetPassword(email);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Passwrd reset OTP sent to email successfully",
    });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
    const { email, otp, newPassword } = req.body;
    await AuthService.resetPassword(email, otp, newPassword);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Password reset successfully",
    });
});

export const getMe = async (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        data: req.user,
    });
};

const getNewToken = catchAsync(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    const betterAuthSessionToken = req.cookies["better-auth.session_token"];
    if (!refreshToken) {
        throw new AppError(status.UNAUTHORIZED, "Refresh token is missing");
    }
    const result = await AuthService.getNewToken(
        refreshToken,
        betterAuthSessionToken,
    );

    const { accessToken, refreshToken: newRefreshToken, sessionToken } = result;

    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setRefreshTokenCookie(res, newRefreshToken);
    tokenUtils.setBetterAuthSessionCookie(res, sessionToken);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "New tokens generated successfully",
        data: {
            accessToken,
            refreshToken: newRefreshToken,
            sessionToken,
        },
    });
});

// /api/v1/auth/login/google?redirect=/profile
const googleLogin = catchAsync((req: Request, res: Response) => {
    const redirectPath = req.query.redirect || "/dashboard";

    const encodedRedirectPath = encodeURIComponent(redirectPath as string);

    const callbackURL = `${envVars.BETTER_AUTH_URL}/api/v1/auth/google/success?redirect=${encodedRedirectPath}`;

    res.render("googleRedirect", {
        callbackURL: callbackURL,
        betterAuthUrl: envVars.BETTER_AUTH_URL,
    });
});

const googleLoginSuccess = catchAsync(async (req: Request, res: Response) => {
    const redirectPath = (req.query.redirect as string) || "/dashboard";

    const sessionToken = req.cookies["better-auth.session_token"];

    if (!sessionToken) {
        return res.redirect(`${envVars.FRONTEND_URL}/login?error=oauth_failed`);
    }

    const session = await auth.api.getSession({
        headers: {
            Cookie: `better-auth.session_token=${sessionToken}`,
        },
    });

    if (!session) {
        return res.redirect(
            `${envVars.FRONTEND_URL}/login?error=no_session_found`,
        );
    }

    if (session && !session.user) {
        return res.redirect(
            `${envVars.FRONTEND_URL}/login?error=no_user_found`,
        );
    }

    const result = await AuthService.googleLoginSuccess(session);

    const { accessToken, refreshToken } = result;

    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setRefreshTokenCookie(res, refreshToken);
    // ?redirect=//profile -> /profile
    const isValidRedirectPath =
        redirectPath.startsWith("/") && !redirectPath.startsWith("//");
    const finalRedirectPath = isValidRedirectPath ? redirectPath : "/dashboard";

    res.redirect(`${envVars.FRONTEND_URL}${finalRedirectPath}`);
});

const handleOAuthError = catchAsync((req: Request, res: Response) => {
    const error = (req.query.error as string) || "oauth_failed";
    res.redirect(`${envVars.FRONTEND_URL}/login?error=${error}`);
});

export const AuthController = {
    registerUser,
    loginUser,
    verifyEmail,
    changePassword,
    forgetPassword,
    resetPassword,
    getMe,
    getNewToken,
    logoutUser,
    handleOAuthError,
    googleLogin,
    googleLoginSuccess,
};
