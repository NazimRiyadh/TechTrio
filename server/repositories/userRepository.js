/**
 * userRepository.js
 * Raw SQL for the `users` table — no business logic here.
 */
import db from "../database/db.js";

// ── Read ────────────────────────────────────────────────────────────────────

export const findByEmail = async (email) => {
  const result = await db.query(`SELECT * FROM users WHERE email = $1`, [
    email,
  ]);
  return result.rows[0] || null;
};

export const findById = async (id) => {
  const result = await db.query(
    `SELECT id, name, email, role, avatar, created_at FROM users WHERE id = $1`,
    [id],
  );
  return result.rows[0] || null;
};

export const findByResetToken = async (hashedToken) => {
  const result = await db.query(
    `SELECT * FROM users
     WHERE reset_password_token = $1
       AND reset_password_expires > NOW()`,
    [hashedToken],
  );
  return result.rows[0] || null;
};

export const emailExistsForOtherUser = async (email, excludeId) => {
  const result = await db.query(
    `SELECT id FROM users WHERE email = $1 AND id != $2`,
    [email, excludeId],
  );
  return result.rows.length > 0;
};

export const getAllPaginated = async (limit, offset) => {
  const result = await db.query(
    `SELECT id, name, email, avatar, role, created_at
     FROM users
     ORDER BY created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset],
  );
  return result.rows;
};

export const countAll = async () => {
  const result = await db.query(`SELECT COUNT(*) FROM users`);
  return parseInt(result.rows[0].count);
};

// ── Write ───────────────────────────────────────────────────────────────────

export const createUser = async ({ name, email, hashedPassword, avatar = null }) => {
  const result = await db.query(
    `INSERT INTO users (name, email, password, avatar)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [name, email, hashedPassword, avatar],
  );
  return result.rows[0];
};

export const updatePassword = async (id, hashedPassword) => {
  await db.query(`UPDATE users SET password = $1 WHERE id = $2`, [
    hashedPassword,
    id,
  ]);
};

export const updateProfile = async (id, { name, email }) => {
  const result = await db.query(
    `UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *`,
    [name, email, id],
  );
  return result.rows[0];
};

export const updateProfileWithAvatar = async (id, { name, email, avatar }) => {
  const result = await db.query(
    `UPDATE users SET name = $1, email = $2, avatar = $3 WHERE id = $4 RETURNING *`,
    [name, email, avatar, id],
  );
  return result.rows[0];
};

export const setResetToken = async (id, hashedToken, expiry) => {
  await db.query(
    `UPDATE users
     SET reset_password_token = $1, reset_password_expires = to_timestamp($2)
     WHERE id = $3`,
    [hashedToken, expiry / 1000, id],
  );
};

export const clearResetToken = async (id) => {
  await db.query(
    `UPDATE users
     SET reset_password_token = NULL, reset_password_expires = NULL
     WHERE id = $1`,
    [id],
  );
};

export const resetPasswordById = async (id, hashedPassword) => {
  await db.query(
    `UPDATE users
     SET password = $1, reset_password_token = NULL, reset_password_expires = NULL
     WHERE id = $2`,
    [hashedPassword, id],
  );
};

export const deleteById = async (id) => {
  const result = await db.query(
    `DELETE FROM users WHERE id = $1 RETURNING *`,
    [id],
  );
  return result.rows[0] || null;
};

export const findAvatarById = async (id) => {
  const result = await db.query(`SELECT id, avatar FROM users WHERE id = $1`, [
    id,
  ]);
  return result.rows[0] || null;
};
