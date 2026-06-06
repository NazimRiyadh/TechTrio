/**
 * reviewRepository.js
 * Raw SQL for the `reviews` table.
 */
import db from "../database/db.js";

export const checkPurchased = async (userId, productId) => {
  const result = await db.query(
    `SELECT oi.product_id
     FROM order_items oi
     JOIN orders   o ON o.id = oi.order_id
     JOIN payments p ON p.order_id = o.id
     WHERE o.buyer_id = $1
       AND oi.product_id = $2
       AND p.payment_status = 'Paid'
     LIMIT 1`,
    [userId, productId],
  );
  return result.rows.length > 0;
};

export const findExisting = async (userId, productId) => {
  const result = await db.query(
    `SELECT * FROM reviews WHERE user_id = $1 AND product_id = $2`,
    [userId, productId],
  );
  return result.rows[0] || null;
};

export const upsertReview = async (userId, productId, rating, comment) => {
  const existing = await findExisting(userId, productId);
  let result;
  if (existing) {
    result = await db.query(
      `UPDATE reviews SET rating=$1, comment=$2
       WHERE user_id=$3 AND product_id=$4 RETURNING *`,
      [rating, comment, userId, productId],
    );
  } else {
    result = await db.query(
      `INSERT INTO reviews (user_id, product_id, rating, comment)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [userId, productId, rating, comment],
    );
  }
  return result.rows[0];
};

export const deleteReview = async (userId, productId) => {
  const result = await db.query(
    `DELETE FROM reviews WHERE user_id=$1 AND product_id=$2 RETURNING *`,
    [userId, productId],
  );
  return result.rows[0] || null;
};

export const getAverageRating = async (productId) => {
  const result = await db.query(
    `SELECT AVG(rating) FROM reviews WHERE product_id = $1`,
    [productId],
  );
  return result.rows[0].avg;
};
