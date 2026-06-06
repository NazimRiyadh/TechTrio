import ErrorHandler from "./errorMiddleware.js";

/**
 * Middleware to validate request body using Zod schema
 * @param {import("zod").ZodSchema} schema
 */
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const errorMessages = result.error.issues.map((err) => err.message).join(", ");
    return next(new ErrorHandler(errorMessages, 400));
  }
  req.body = result.data; // Assign validated and coerced data
  next();
};

/**
 * Middleware to validate request query using Zod schema
 * @param {import("zod").ZodSchema} schema
 */
export const validateQuery = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.query);
  if (!result.success) {
    const errorMessages = result.error.issues.map((err) => err.message).join(", ");
    return next(new ErrorHandler(errorMessages, 400));
  }
  req.query = result.data; // Assign validated and coerced data
  next();
};

