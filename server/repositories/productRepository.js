/**
 * productRepository.js
 * Raw SQL for `products` table — no business logic.
 */
import db from "../database/db.js";

// ── Read ────────────────────────────────────────────────────────────────────

export const findById = async (id) => {
  const result = await db.query(`SELECT * FROM products WHERE id = $1`, [id]);
  return result.rows[0] || null;
};

export const findByIdWithReviews = async (id) => {
  const result = await db.query(
    `SELECT p.*,
       COALESCE(
         (SELECT jsonb_agg(
           jsonb_build_object(
             'review_id',  r.id,
             'rating',     r.rating,
             'comment',    r.comment,
             'created_at', r.created_at,
             'reviewer',   jsonb_build_object(
                             'id',     u.id,
                             'name',   u.name,
                             'avatar', u.avatar
                           )
           )
           ORDER BY r.created_at DESC
         )
         FROM reviews r
         LEFT JOIN users u ON r.user_id = u.id
         WHERE r.product_id = p.id
         ),
         '[]'::jsonb
       ) AS reviews
     FROM products p
     WHERE p.id = $1`,
    [id],
  );
  return result.rows[0] || null;
};

export const countWithFilters = async (conditions, values) => {
  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";
  const result = await db.query(
    `SELECT COUNT(*) FROM products p ${whereClause}`,
    values,
  );
  return parseInt(result.rows[0].count);
};

export const findAllWithFilters = async (conditions, values, limit, offset, sort) => {
  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";
  const idx = values.length;
  
  let orderBy = "ORDER BY p.created_at DESC";
  if (sort === "price-asc") {
    orderBy = "ORDER BY p.price ASC";
  } else if (sort === "price-desc") {
    orderBy = "ORDER BY p.price DESC";
  } else if (sort === "ratings-desc") {
    orderBy = "ORDER BY p.ratings DESC, p.created_at DESC";
  } else if (sort === "newest") {
    orderBy = "ORDER BY p.created_at DESC";
  }

  const query = `
    SELECT p.*,
           COUNT(r.id) AS review_count
    FROM products p
    LEFT JOIN reviews r ON p.id = r.product_id
    ${whereClause}
    GROUP BY p.id
    ${orderBy}
    LIMIT $${idx + 1}
    OFFSET $${idx + 2}
  `;
  const result = await db.query(query, [...values, limit, offset]);
  return result.rows;
};

export const findNewProducts = async (limitCount = 8) => {
  const result = await db.query(
    `SELECT p.*, COUNT(r.id) AS review_count
     FROM products p
     LEFT JOIN reviews r ON p.id = r.product_id
     WHERE p.created_at >= NOW() - INTERVAL '30 days'
     GROUP BY p.id
     ORDER BY p.created_at DESC
     LIMIT $1`,
    [limitCount],
  );
  return result.rows;
};

export const findTopRated = async (minRating = 4.5, limitCount = 8) => {
  const result = await db.query(
    `SELECT p.*, COUNT(r.id) AS review_count
     FROM products p
     LEFT JOIN reviews r ON p.id = r.product_id
     WHERE p.ratings >= $1
     GROUP BY p.id
     ORDER BY p.ratings DESC, p.created_at DESC
     LIMIT $2`,
    [minRating, limitCount],
  );
  return result.rows;
};

export const findAdminWithFilters = async (conditions, values) => {
  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";
  const result = await db.query(
    `SELECT * FROM products ${whereClause} ORDER BY created_at DESC`,
    values,
  );
  return result.rows;
};

export const getAllCategories = async () => {
  const result = await db.query(
    `SELECT category, COUNT(*)::int AS cnt
     FROM products
     GROUP BY category
     ORDER BY category`,
  );
  return result.rows;
};

// ── Write ───────────────────────────────────────────────────────────────────

export const createProduct = async ({
  name,
  description,
  price,
  category,
  stock,
  images,
  createdBy,
}) => {
  const result = await db.query(
    `INSERT INTO products (name, description, price, category, stock, images, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [name, description, price, category, stock, JSON.stringify(images), createdBy],
  );
  return result.rows[0];
};

export const updateProduct = async (
  id,
  { name, description, price, category, stock },
) => {
  const result = await db.query(
    `UPDATE products
     SET name=$1, description=$2, price=$3, category=$4, stock=$5
     WHERE id=$6 RETURNING *`,
    [name, description, price, category, stock, id],
  );
  return result.rows[0] || null;
};

export const updateRating = async (id, avgRating) => {
  await db.query(`UPDATE products SET ratings=$1 WHERE id=$2`, [avgRating, id]);
};

export const deleteProduct = async (id) => {
  const result = await db.query(
    `DELETE FROM products WHERE id=$1 RETURNING *`,
    [id],
  );
  return result.rows[0] || null;
};
