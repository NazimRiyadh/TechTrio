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
  
  // Express 5 makes req.query a getter-only property. Mutate its keys instead of reassigning.
  for (const key in req.query) {
    delete req.query[key];
  }
  Object.assign(req.query, result.data);
  next();
};
