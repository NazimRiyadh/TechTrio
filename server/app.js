import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import authRoutes from "./routers/authRoutes.js";
import productRoutes from "./routers/productRoutes.js";
import adminRoutes from "./routers/adminRoutes.js";
import orderRoutes from "./routers/orderRoutes.js";
import paymentRoutes from "./routers/paymentRoutes.js";
import { globalLimiter } from "./utils/rateLimiter.js";
import { stripeWebhook } from "./controllers/webhookController.js";

const app = express();

// ── CORS ────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: [process.env.FRONTEND_URL, process.env.DASHBOARD_URL],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  }),
);

// ── Stripe webhook — must use raw body BEFORE express.json() ────────────────
app.post(
  "/api/v1/payment/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook,
);

// ── Body parsers ─────────────────────────────────────────────────────────────
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "./uploads",
  }),
);

// ── Routes ───────────────────────────────────────────────────────────────────
app.use("/api", globalLimiter);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/order", orderRoutes);
app.use("/api/v1/payment", paymentRoutes);

// ── Global error handler ─────────────────────────────────────────────────────
app.use(errorMiddleware);

export default app;
