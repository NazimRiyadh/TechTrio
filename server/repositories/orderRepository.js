/**
 * orderRepository.js
 * Raw SQL for `orders`, `order_items`, and `shipping_infos` tables.
 * Transactional helpers accept a `client` (pg.PoolClient) for atomic ops.
 */
import db from "../database/db.js";

// ── Shared rich SELECT used across multiple queries ──────────────────────────
const ORDER_WITH_ITEMS_SQL = `
  SELECT o.*,
    COALESCE(
      json_agg(
        json_build_object(
          'order_item_id', oi.id,
          'order_id',      oi.order_id,
          'product_id',    oi.product_id,
          'quantity',      oi.quantity,
          'price',         oi.price,
          'image',         oi.image,
          'title',         oi.title
        )
      ) FILTER (WHERE oi.id IS NOT NULL),
      '[]'
    ) AS order_items,
    json_build_object(
      'full_name', s.full_name,
      'state',     s.state,
      'city',      s.city,
      'country',   s.country,
      'address',   s.address,
      'pincode',   s.pincode,
      'phone',     s.phone
    ) AS shipping_info
  FROM orders o
  LEFT JOIN order_items   oi ON o.id = oi.order_id
  LEFT JOIN shipping_infos s ON o.id = s.order_id
`;

// ── Read ─────────────────────────────────────────────────────────────────────

export const findById = async (orderId) => {
  const result = await db.query(
    `${ORDER_WITH_ITEMS_SQL} WHERE o.id = $1 GROUP BY o.id, s.id`,
    [orderId],
  );
  return result.rows[0] || null;
};

export const findByIdWithBuyer = async (orderId) => {
  const result = await db.query(
    `SELECT o.*, u.email, u.name
     FROM orders o
     JOIN users u ON o.buyer_id = u.id
     WHERE o.id = $1`,
    [orderId],
  );
  return result.rows[0] || null;
};

export const findByBuyerId = async (userId) => {
  const result = await db.query(
    `${ORDER_WITH_ITEMS_SQL}
     WHERE o.buyer_id = $1
     GROUP BY o.id, s.id`,
    [userId],
  );
  return result.rows;
};

export const findAllPaid = async () => {
  const result = await db.query(
    `${ORDER_WITH_ITEMS_SQL}
     GROUP BY o.id, s.id`,
  );
  return result.rows;
};

export const findItemsByOrderId = async (orderId) => {
  const result = await db.query(
    `SELECT product_id, quantity FROM order_items WHERE order_id = $1`,
    [orderId],
  );
  return result.rows;
};

// ── Write ─────────────────────────────────────────────────────────────────────

export const createOrder = async (
  { buyerId, totalPrice, taxPrice, shippingPrice },
  client,
) => {
  const runner = client || db;
  const result = await runner.query(
    `INSERT INTO orders (buyer_id, total_price, tax_price, shipping_price)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [buyerId, totalPrice, taxPrice, shippingPrice],
  );
  return result.rows[0];
};

export const createOrderItems = async (orderId, items, client) => {
  // items: Array<{ productId, quantity, price, image, title }>
  const runner = client || db;
  const values = [];
  const placeholders = [];
  items.forEach((item, index) => {
    const offset = index * 6;
    values.push(
      orderId,
      item.productId,
      item.quantity,
      item.price,
      item.image,
      item.title,
    );
    placeholders.push(
      `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6})`,
    );
  });
  await runner.query(
    `INSERT INTO order_items (order_id, product_id, quantity, price, image, title)
     VALUES ${placeholders.join(", ")}`,
    values,
  );
};

export const createShippingInfo = async (orderId, shippingData, client) => {
  const runner = client || db;
  const { full_name, state, city, country, address, pincode, phone } =
    shippingData;
  await runner.query(
    `INSERT INTO shipping_infos (order_id, full_name, state, city, country, address, pincode, phone)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [orderId, full_name, state, city, country, address, pincode, phone],
  );
};

export const updateStatus = async (orderId, status) => {
  const result = await db.query(
    `UPDATE orders SET order_status = $1 WHERE id = $2 RETURNING *`,
    [status, orderId],
  );
  return result.rows[0] || null;
};

// Used inside the Stripe webhook transaction
export const markAsPaid = async (orderId, client) => {
  await client.query(
    `UPDATE orders SET paid_at = NOW() WHERE id = $1`,
    [orderId],
  );
};

export const reduceStock = async (productId, quantity, client) => {
  await client.query(
    `UPDATE products SET stock = GREATEST(stock - $1, 0) WHERE id = $2`,
    [quantity, productId],
  );
};

export const deleteOrder = async (orderId) => {
  const result = await db.query(
    `DELETE FROM orders WHERE id = $1 RETURNING *`,
    [orderId],
  );
  return result.rows[0] || null;
};
