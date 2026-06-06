/**
 * adminService.js
 * Business logic for admin-only operations.
 */
import { v2 as cloudinary } from "cloudinary";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import * as userRepo from "../repositories/userRepository.js";
import * as statsRepo from "../repositories/statsRepository.js";

export const getAllUsers = async (page, limit) => {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(50, Math.max(1, limit));
  const offset = (safePage - 1) * safeLimit;

  const [users, totalUsers] = await Promise.all([
    userRepo.getAllPaginated(safeLimit, offset),
    userRepo.countAll(),
  ]);

  const totalPages = Math.ceil(totalUsers / safeLimit);

  return {
    users,
    pagination: {
      currentPage: safePage,
      totalPages,
      totalUsers,
      limit: safeLimit,
      hasNextPage: safePage < totalPages,
      hasPrevPage: safePage > 1,
    },
  };
};

export const deleteUser = async (targetId, adminId) => {
  if (targetId === adminId)
    throw new ErrorHandler("You cannot delete your own admin account", 400);

  const user = await userRepo.findAvatarById(targetId);
  if (!user) throw new ErrorHandler("User not found", 404);

  if (user.avatar?.public_id) {
    await cloudinary.uploader.destroy(user.avatar.public_id);
  }

  return await userRepo.deleteById(targetId);
};

export const getDashboardStats = async () => {
  const today = new Date();
  const todayDate = today.toISOString().split("T")[0];
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayDate = yesterday.toISOString().split("T")[0];

  const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const currentMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const previousMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const previousMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

  const [
    totalRevenueAllTime,
    totalUsersCount,
    orderStatusCounts,
    todayRevenue,
    yesterdayRevenue,
    monthlySales,
    topSellingProducts,
    currentMonthSales,
    lastMonthRevenue,
    lowStockProducts,
    categorySales,
    newUsersThisMonth,
  ] = await Promise.all([
    statsRepo.getTotalRevenue(),
    statsRepo.getTotalUsersCount(),
    statsRepo.getOrderStatusCounts(),
    statsRepo.getRevenueByDate(todayDate),
    statsRepo.getRevenueByDate(yesterdayDate),
    statsRepo.getMonthlySales(),
    statsRepo.getTopSellingProducts(),
    statsRepo.getRevenueBetween(currentMonthStart, currentMonthEnd),
    statsRepo.getRevenueBetween(previousMonthStart, previousMonthEnd),
    statsRepo.getLowStockProducts(),
    statsRepo.getCategorySales(),
    statsRepo.getNewUsersThisMonth(currentMonthStart),
  ]);

  let revenueGrowth = "0%";
  if (lastMonthRevenue > 0) {
    const rate = ((currentMonthSales - lastMonthRevenue) / lastMonthRevenue) * 100;
    revenueGrowth = `${rate >= 0 ? "+" : ""}${rate.toFixed(2)}%`;
  }

  return {
    totalRevenueAllTime,
    todayRevenue,
    yesterdayRevenue,
    totalUsersCount,
    orderStatusCounts,
    monthlySales,
    currentMonthSales,
    topSellingProducts,
    lowStockProducts,
    categorySales,
    revenueGrowth,
    newUsersThisMonth,
  };
};
