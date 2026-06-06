import express from "express";
import {
  createProduct,
  fetchAllProducts,
  fetchAdminProducts,
  updateProduct,
  deleteProduct,
  fetchSingleProduct,
  postProductReview,
  deleteReview,
} from "../controllers/productController.js";
import { authorizedRoles, isAuthenticated } from "../middlewares/authMiddleware.js";
import { validate, validateQuery } from "../middlewares/validateMiddleware.js";
import * as productValidator from "../validators/productValidator.js";

const router = express.Router();

// Public
router.get("/", validateQuery(productValidator.productQuery), fetchAllProducts);
router.get("/singleProduct/:productId", fetchSingleProduct);

// Admin-only
router.post(
  "/admin/create",
  isAuthenticated,
  authorizedRoles("admin"),
  validate(productValidator.createProduct),
  createProduct,
);
router.get(
  "/admin/all",
  isAuthenticated,
  authorizedRoles("admin"),
  fetchAdminProducts,
);
router.put(
  "/admin/update/:productId",
  isAuthenticated,
  authorizedRoles("admin"),
  validate(productValidator.updateProduct),
  updateProduct,
);
router.delete(
  "/admin/delete/:productId",
  isAuthenticated,
  authorizedRoles("admin"),
  deleteProduct,
);

// Authenticated buyers
router.put(
  "/post-new/review/:productId",
  isAuthenticated,
  validate(productValidator.postReview),
  postProductReview,
);
router.delete("/delete/review/:productId", isAuthenticated, deleteReview);

export default router;
