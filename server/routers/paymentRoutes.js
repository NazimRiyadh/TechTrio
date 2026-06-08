import express from "express";
import { processPayment, sendStripePublishableKey } from "../controllers/paymentController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import { sensitiveLimiter } from "../utils/rateLimiter.js";

const router = express.Router();

router.post("/process", isAuthenticated, sensitiveLimiter, processPayment);
router.get("/stripe-key", isAuthenticated, sendStripePublishableKey);

export default router;
