import { z } from "zod";

const VALID_STATUSES = ["Processing", "Shipped", "Delivered", "Cancelled"];

export const placeOrder = z.object({
  full_name: z.string({ required_error: "Full name is required" }).trim().min(1, "Full name is required"),
  address: z.string({ required_error: "Address is required" }).trim().min(1, "Address is required"),
  city: z.string({ required_error: "City is required" }).trim().min(1, "City is required"),
  state: z.string({ required_error: "State is required" }).trim().min(1, "State is required"),
  country: z.string({ required_error: "Country is required" }).trim().min(1, "Country is required"),
  pincode: z.preprocess(
    (val) => (val === undefined || val === null ? "" : String(val).trim()),
    z.string().min(1, "Pincode is required")
  ),
  phone: z.preprocess(
    (val) => (val === undefined || val === null ? "" : String(val).trim()),
    z.string().min(1, "Phone number is required")
  ),
  orderedItems: z.preprocess(
    (val) => {
      if (typeof val === "string") {
        try {
          return JSON.parse(val);
        } catch {
          return val;
        }
      }
      return val;
    },
    z.array(
      z.object({
        product: z.object({
          id: z.string().uuid("Product ID must be a valid UUID"),
          images: z.array(z.object({ url: z.string().optional() })).optional(),
        }),
        quantity: z.number().int().positive("Quantity must be a positive integer"),
      })
    ).min(1, "At least one item is required in the order")
  ),
});

export const updateStatus = z.object({
  status: z.enum(VALID_STATUSES, {
    errorMap: () => ({ message: `Status must be one of: ${VALID_STATUSES.join(", ")}` }),
  }),
});
