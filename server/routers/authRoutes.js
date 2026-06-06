import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getUser,
  forgotPassword,
  resetPassword,
  updatePassword,
  updateProfile,
} from "../controllers/authController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import { authLimiter } from "../utils/rateLimiter.js";
import { validate } from "../middlewares/validateMiddleware.js";
import * as authValidator from "../validators/authValidator.js";

const router = express.Router();

router.post("/register", authLimiter, validate(authValidator.register), registerUser);
router.post("/login", authLimiter, validate(authValidator.login), loginUser);
router.post("/logout", isAuthenticated, logoutUser);
router.get("/me", isAuthenticated, getUser);
router.post("/forgot", authLimiter, validate(authValidator.forgotPassword), forgotPassword);
router.put("/reset/:token", authLimiter, validate(authValidator.resetPassword), resetPassword);
router.put("/update/password", isAuthenticated, validate(authValidator.updatePassword), updatePassword);
router.put("/update/profile", isAuthenticated, validate(authValidator.updateProfile), updateProfile);

export default router;
