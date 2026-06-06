/**
 * statsRepository.js
 * All aggregate/analytics SQL for the admin dashboard.
 * Each function is a single, named query — easy to unit-test and optimise.
 */
import db from "../database/db.js";

export const getTotalRevenue = async () => {
  const result = await db.query(
    `SELECT COALESCE(SUM(total_price), 0) FROM orders WHERE paid_at IS NOT NULL`,
  );
  return parseFloat(result.rows[0].sum) || 0;
};

export const getTotalUsersCount = async () => {
  const result = await db.query(
    `SELECT COUNT(*) FROM users WHERE role = 'user'`,
  );
  return parseInt(result.rows[0].count);
};

export const getOrderStatusCounts = async () => {
  const result = await db.query(
    `SELECT order_status, COUNT(*)
     FROM orders
     WHERE paid_at IS NOT NULL
     GROUP BY order_status`,
  );
  const counts = { Processing: 0, Shipped: 0, Delivered: 0, Cancelled: 0 };
  result.rows.forEach((row) => {
    counts[row.order_status] = parseInt(row.count);
  });
  return counts;
};

export const getRevenueByDate = async (date) => {
  const result = await db.query(
    `SELECT COALESCE(SUM(total_price), 0)
     FROM orders
     WHERE created_at::date = $1 AND paid_at IS NOT NULL`,
    [date],
  );
  return parseFloat(result.rows[0].sum) || 0;
};

export const getMonthlySales = async () => {
  const result = await db.query(
    `SELECT
       TO_CHAR(created_at, 'Mon YYYY') AS month,
       DATE_TRUNC('month', created_at) AS date,
       SUM(total_price) AS totalsales
     FROM orders
     WHERE paid_at IS NOT NULL
     GROUP BY month, date
     ORDER BY date ASC`,
  );
  return result.rows.map((row) => ({
    month: row.month,
    totalsales: parseFloat(row.totalsales) || 0,
  }));
};

export const getTopSellingProducts = async (limitCount = 5) => {
  const result = await db.query(
    `SELECT
       p.name,
       p.images->0->>'url' AS image,
       p.category,
       p.ratings,
       SUM(oi.quantity) AS total_sold
     FROM order_items oi
     JOIN products p ON p.id = oi.product_id
     JOIN orders   o ON o.id = oi.order_id
     WHERE o.paid_at IS NOT NULL
     GROUP BY p.name, p.images, p.category, p.ratings
     ORDER BY total_sold DESC
     LIMIT $1`,
    [limitCount],
  );
  return result.rows;
};

export const getRevenueBetween = async (start, end) => {
  const result = await db.query(
    `SELECT COALESCE(SUM(total_price), 0) AS total
     FROM orders
     WHERE paid_at IS NOT NULL AND created_at BETWEEN $1 AND $2`,
    [start, end],
  );
  return parseFloat(result.rows[0].total) || 0;
};

export const getLowStockProducts = async (threshold = 5) => {
  const result = await db.query(
    `SELECT name, stock FROM products WHERE stock <= $1`,
    [threshold],
  );
  return result.rows;
};

export const getCategorySales = async () => {
  const result = await db.query(
    `SELECT
       p.category,
       COALESCE(SUM(oi.quantity * oi.price), 0) AS revenue
     FROM order_items oi
     JOIN products p ON p.id = oi.product_id
     JOIN orders   o ON o.id = oi.order_id
     WHERE o.paid_at IS NOT NULL
     GROUP BY p.category
     ORDER BY revenue DESC`,
  );
  return result.rows.map((row) => ({
    name: row.category,
    revenue: parseFloat(row.revenue) || 0,
  }));
};

export const getNewUsersThisMonth = async (start) => {
  const result = await db.query(
    `SELECT COUNT(*) FROM users WHERE created_at >= $1 AND role = 'user'`,
    [start],
  );
  return parseInt(result.rows[0].count) || 0;
};
