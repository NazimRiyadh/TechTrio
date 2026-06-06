/**
 * adminController.js
 * HTTP layer only — delegates to adminService.
 */
import { catchAsyncErrors } from "../middlewares/catchAsyncMiddleware.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import * as adminService from "../services/adminService.js";

export const getAllUsers = catchAsyncErrors(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const { users, pagination } = await adminService.getAllUsers(page, limit);
  res.status(200).json({
    success: true,
    message: "Users fetched successfully",
    users,
    pagination,
  });
});

export const deleteUser = catchAsyncErrors(async (req, res) => {
  const deleted = await adminService.deleteUser(req.params.userId, req.user.id);
  res.status(200).json({
    success: true,
    message: "User deleted successfully",
    deletedUser: {
      id: deleted.id,
      name: deleted.name,
      email: deleted.email,
    },
  });
});

export const dashboardStats = catchAsyncErrors(async (req, res) => {
  const stats = await adminService.getDashboardStats();
  res.status(200).json({
    success: true,
    message: "Dashboard Stats Fetched Successfully",
    ...stats,
  });
});
