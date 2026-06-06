/**
 * errorMiddleware.js
 * Custom error class + global Express error handler.
 * Handles PostgreSQL-specific error codes instead of MongoDB ones.
 */
import { logger } from "../utils/logger.js";

class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode || 500;
  }
}

export const errorMiddleware = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  // ── PostgreSQL error codes ─────────────────────────────────────────────────
  if (err.code === "23505") {
    // unique_violation
    const field = err.detail?.match(/Key \((.+?)\)=/)?.[1] || "field";
    err = new ErrorHandler(`A record with this ${field} already exists.`, 409);
  }

  if (err.code === "22P02") {
    // invalid_text_representation (e.g. malformed UUID)
    err = new ErrorHandler("Invalid ID format provided.", 400);
  }

  if (err.code === "23503") {
    // foreign_key_violation
    err = new ErrorHandler("Referenced resource does not exist.", 400);
  }

  // ── JWT errors ─────────────────────────────────────────────────────────────
  if (err.name === "JsonWebTokenError")
    err = new ErrorHandler("Invalid authentication token.", 401);

  if (err.name === "TokenExpiredError")
    err = new ErrorHandler("Authentication token has expired.", 401);

  // ── Logging ────────────────────────────────────────────────────────────────
  if (err.statusCode >= 500) {
    logger.error(err.message, {
      stack: err.stack,
      path: req.path,
      method: req.method,
    });
  } else if (process.env.NODE_ENV === "development") {
    logger.debug(err.message, { code: err.code, path: req.path });
  }

  return res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};

export default ErrorHandler;
