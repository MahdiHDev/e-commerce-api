import { Request, Response } from "express";
import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { tokenUtils } from "../../utils/token";
import { AuthService } from "./auth.service";

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

export const AuthController = {
    loginUser,
    changePassword,
    forgetPassword,
    resetPassword,
    getMe,
};
