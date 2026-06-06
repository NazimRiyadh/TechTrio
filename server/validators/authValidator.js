import { z } from "zod";

export const register = z.object({
  name: z.string({ required_error: "Name is required" }).trim().min(3, "Name must be at least 3 characters"),
  email: z.string({ required_error: "Email is required" }).trim().email("Please provide a valid email address"),
  password: z.string({ required_error: "Password is required" }).min(8, "Password must be at least 8 characters"),
});

export const login = z.object({
  email: z.string({ required_error: "Email is required" }).trim().email("Please provide a valid email address"),
  password: z.string({ required_error: "Password is required" }).min(1, "Password is required"),
});

export const forgotPassword = z.object({
  email: z.string({ required_error: "Email is required" }).trim().email("Please provide a valid email address"),
});

export const resetPassword = z.object({
  password: z.string({ required_error: "Password is required" }).min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string({ required_error: "Please confirm your password" }).min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const updatePassword = z.object({
  oldPassword: z.string({ required_error: "Current password is required" }).min(1, "Current password is required"),
  newPassword: z.string({ required_error: "New password is required" }).min(8, "New password must be at least 8 characters"),
  confirmPassword: z.string({ required_error: "Please confirm your new password" }).min(1, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const updateProfile = z.object({
  name: z.string({ required_error: "Name is required" }).trim().min(3, "Name must be at least 3 characters"),
  email: z.string({ required_error: "Email is required" }).trim().email("Please provide a valid email address"),
});
