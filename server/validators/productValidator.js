import { z } from "zod";

const VALID_AVAILABILITIES = ["in-stock", "limited", "out-of-stock"];

export const createProduct = z.object({
  name: z.string({ required_error: "Product name is required" }).trim().min(1, "Product name is required"),
  description: z.string({ required_error: "Product description is required" }).trim().min(1, "Product description is required"),
  price: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
    z.number({ required_error: "A valid price is required", invalid_type_error: "A valid price is required" })
      .positive("A valid price is required")
  ),
  category: z.string({ required_error: "Category is required" }).trim().min(1, "Category is required"),
  stock: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
    z.number({ required_error: "A valid stock quantity is required", invalid_type_error: "A valid stock quantity is required" })
      .int("A valid stock quantity is required")
      .nonnegative("A valid stock quantity is required")
  ),
});

export const updateProduct = createProduct;

export const postReview = z.object({
  rating: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
    z.number({ required_error: "Rating is required", invalid_type_error: "Rating is required" })
      .min(1, "Rating must be between 1 and 5")
      .max(5, "Rating must be between 1 and 5")
  ),
  comment: z.string({ required_error: "Comment is required" }).trim().min(1, "Comment is required"),
});

export const productQuery = z.object({
  page: z.preprocess(
    (val) => (val === undefined || val === null ? undefined : Number(val)),
    z.number().int().positive("Page must be a positive integer").optional()
  ),
  limit: z.preprocess(
    (val) => (val === undefined || val === null ? undefined : Number(val)),
    z.number().int().positive("Limit must be a positive integer").optional()
  ),
  price: z.string().regex(/^\d+(\.\d+)?-\d+(\.\d+)?$/, "Price filter must be in the format 'min-max' (e.g. 100-500)").optional(),
  availability: z.enum(VALID_AVAILABILITIES, {
    errorMap: () => ({ message: `Availability must be one of: ${VALID_AVAILABILITIES.join(", ")}` }),
  }).optional(),
  ratings: z.preprocess(
    (val) => (val === undefined || val === null ? undefined : Number(val)),
    z.number().min(0, "Ratings filter must be a number between 0 and 5").max(5, "Ratings filter must be a number between 0 and 5").optional()
  ),
  category: z.string().optional(),
  search: z.string().optional(),
});
