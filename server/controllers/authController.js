/**
 * authController.js
 * HTTP layer only — parses request, calls authService, returns response.
 */
import { catchAsyncErrors } from "../middlewares/catchAsyncMiddleware.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { sendToken } from "../utils/jwtToken.js";
import * as authService from "../services/authService.js";

export const registerUser = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return next(new ErrorHandler("Please enter all fields", 400));

  const user = await authService.registerUser({ name, email, password });
  sendToken(user, 201, res);
});

export const loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new ErrorHandler("Please enter all fields", 400));

  const user = await authService.loginUser({ email, password });
  sendToken(user, 200, res);
});

export const logoutUser = catchAsyncErrors(async (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({ success: true, message: "Logged out successfully" });
});

export const getUser = catchAsyncErrors(async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const { email } = req.body;
  if (!email) return next(new ErrorHandler("Please provide your email", 400));

  await authService.forgotPassword(email, process.env.FRONTEND_URL);
  res.status(200).json({
    success: true,
    message: "Reset password link sent successfully",
  });
});

export const resetPassword = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;

  if (!password || !confirmPassword)
    return next(new ErrorHandler("Please enter all fields", 400));

  const user = await authService.resetPassword(token, password, confirmPassword);
  sendToken(user, 200, res);
});

export const updatePassword = catchAsyncErrors(async (req, res, next) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  if (!oldPassword || !newPassword || !confirmPassword)
    return next(new ErrorHandler("Please enter all fields", 400));

  const user = await authService.updatePassword(req.user.id, {
    oldPassword,
    newPassword,
    confirmPassword,
  });
  sendToken(user, 200, res);
});

export const updateProfile = catchAsyncErrors(async (req, res, next) => {
  const { name, email } = req.body;
  if (!name || !email)
    return next(new ErrorHandler("Please enter all fields", 400));

  const avatarFile = req.files?.avatar || null;
  const user = await authService.updateProfile(req.user.id, { name, email }, avatarFile);
  sendToken(user, 200, res);
});
