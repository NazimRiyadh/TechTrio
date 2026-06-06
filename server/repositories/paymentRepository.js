/**
 * paymentRepository.js
 * Raw SQL for the `payments` table.
 * Transactional helpers accept a `client` (pg.PoolClient).
 */
import db from "../database/db.js";

export const findByOrderId = async (orderId) => {
  const result = await db.query(
    `SELECT * FROM payments WHERE order_id = $1`,
    [orderId],
  );
  return result.rows[0] || null;
};

export const findByPaymentIntentId = async (paymentIntentId, client) => {
  const runner = client || db;
  const result = await runner.query(
    `SELECT * FROM payments WHERE payment_intent_id = $1`,
    [paymentIntentId],
  );
  return result.rows[0] || null;
};

export const createPayment = async (
  { orderId, type, status, intentId, clientSecret },
  client,
) => {
  const runner = client || db;
  await runner.query(
    `INSERT INTO payments
       (order_id, payment_type, payment_status, payment_intent_id, payment_intent_client_secret)
     VALUES ($1, $2, $3, $4, $5)`,
    [orderId, type, status, intentId, clientSecret],
  );
};

export const updatePaymentStatus = async (intentId, status, client) => {
  const runner = client || db;
  await runner.query(
    `UPDATE payments SET payment_status = $1 WHERE payment_intent_id = $2`,
    [status, intentId],
  );
};
