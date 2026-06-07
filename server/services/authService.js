/**
 * authService.js
 * Pure business logic for authentication.
 * No `req`/`res` — no SQL. Calls repositories only.
 */
import bcrypt from "bcrypt";
import crypto from "crypto";
import { v2 as cloudinary } from "cloudinary";

import * as userRepo from "../repositories/userRepository.js";
import { generateResetPasswordToken } from "../utils/generateResetPasswordToken.js";
import { sendEmail } from "../utils/sendEmail.js";
import { generateEmailPasswordForgotTemplate } from "../utils/generateEmailPasswordForgotTemplate.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";

const SALT_ROUNDS = 10;

export const registerUser = async ({ name, email, password }, avatarFile) => {
  const existing = await userRepo.findByEmail(email);
  if (existing) throw new ErrorHandler("User already exists", 400);

  let avatar = null;
  if (avatarFile) {
    const uploaded = await cloudinary.uploader.upload(avatarFile.tempFilePath, {
      folder: "bigbazar/profile/avatars",
      width: 150,
      height: 150,
      crop: "fill",
    });
    avatar = { public_id: uploaded.public_id, url: uploaded.secure_url };
  }

  const hashedPassword = await bcrypt.hash(password.toString(), SALT_ROUNDS);
  const user = await userRepo.createUser({ name, email, hashedPassword, avatar });
  return user;
};

export const loginUser = async ({ email, password }) => {
  // findByEmail returns full row (with password) for comparison only
  const user = await userRepo.findByEmail(email);
  if (!user) throw new ErrorHandler("Invalid credentials", 401);

  const valid = await bcrypt.compare(password.toString(), user.password);
  if (!valid) throw new ErrorHandler("Invalid credentials", 401);

  return user;
};

export const forgotPassword = async (email, frontendUrl) => {
  const user = await userRepo.findByEmail(email);
  if (!user) throw new ErrorHandler("User not found", 404);

  const { resetToken, hashedToken, resetTokenExpiry } =
    generateResetPasswordToken();

  await userRepo.setResetToken(user.id, hashedToken, resetTokenExpiry);

  const resetTokenUrl = `${frontendUrl}/password/reset/${resetToken}`;
  const html = generateEmailPasswordForgotTemplate(resetTokenUrl, user.name);

  try {
    await sendEmail({ email, subject: "Reset Password", html });
  } catch {
    await userRepo.clearResetToken(user.id);
    throw new ErrorHandler("Failed to send reset password link", 500);
  }
};

export const resetPassword = async (token, password, confirmPassword) => {
  if (password !== confirmPassword)
    throw new ErrorHandler("Passwords do not match", 400);

  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await userRepo.findByResetToken(hashedToken);
  if (!user) throw new ErrorHandler("Invalid or expired token", 400);

  const hashedPassword = await bcrypt.hash(password.toString(), SALT_ROUNDS);
  await userRepo.resetPasswordById(user.id, hashedPassword);

  return user;
};

export const updatePassword = async (
  userId,
  { oldPassword, newPassword, confirmPassword },
) => {
  if (newPassword !== confirmPassword)
    throw new ErrorHandler("Passwords do not match", 400);

  const user = await userRepo.findByEmail(
    // need full row for password — use a dedicated lookup
    (await userRepo.findById(userId)).email,
  );
  const valid = await bcrypt.compare(oldPassword.toString(), user.password);
  if (!valid) throw new ErrorHandler("Invalid current password", 400);

  const hashedPassword = await bcrypt.hash(
    newPassword.toString(),
    SALT_ROUNDS,
  );
  await userRepo.updatePassword(userId, hashedPassword);
  return await userRepo.findById(userId);
};

export const updateProfile = async (userId, { name, email }, avatarFile) => {
  const emailTaken = await userRepo.emailExistsForOtherUser(email, userId);
  if (emailTaken) throw new ErrorHandler("Email already in use", 400);

  if (avatarFile) {
    const existing = await userRepo.findAvatarById(userId);
    const uploaded = await cloudinary.uploader.upload(avatarFile.tempFilePath, {
      folder: "bigbazar/profile/avatars",
      width: 150,
      height: 150,
      crop: "fill",
    });

    if (existing?.avatar?.public_id) {
      await cloudinary.uploader.destroy(existing.avatar.public_id);
    }

    const avatar = { public_id: uploaded.public_id, url: uploaded.secure_url };
    return await userRepo.updateProfileWithAvatar(userId, { name, email, avatar });
  }

  return await userRepo.updateProfile(userId, { name, email });
};
