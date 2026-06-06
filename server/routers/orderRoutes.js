import express from "express";
import {
  fetchSingleOrder,
  placeNewOrder,
  fetchMyOrders,
  fetchAllOrders,
  updateOrderStatus,
  deleteOrder,
} from "../controllers/orderController.js";
import { isAuthenticated, authorizedRoles } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validateMiddleware.js";
import * as orderValidator from "../validators/orderValidator.js";

const router = express.Router();

router.post("/new", isAuthenticated, validate(orderValidator.placeOrder), placeNewOrder);
router.get("/orders/me", isAuthenticated, fetchMyOrders);
router.get("/:orderId", isAuthenticated, fetchSingleOrder);
router.get("/admin/getall", isAuthenticated, authorizedRoles("admin"), fetchAllOrders);
router.put(
  "/admin/update/:orderId",
  isAuthenticated,
  authorizedRoles("admin"),
  validate(orderValidator.updateStatus),
  updateOrderStatus,
);
router.delete("/admin/delete/:orderId", isAuthenticated, authorizedRoles("admin"), deleteOrder);

export default router;
