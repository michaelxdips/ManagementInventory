const db = require('../db/mysql');

const baseSelect = `
  SELECT id, name, username, password_hash, role, unit_id, created_at
  FROM users
`;

async function findByUsername(username) {
  const [rows] = await db.execute(`${baseSelect} WHERE username = ? LIMIT 1`, [username]);
  return rows[0] || null;
}

async function findById(id) {
  const [rows] = await db.execute(`${baseSelect} WHERE id = ? LIMIT 1`, [id]);
  return rows[0] || null;
}

async function createUser({ name, username, password_hash, role = 'user', unit_id = null }) {
  const sql = `
    INSERT INTO users (name, username, password_hash, role, unit_id)
    VALUES (?, ?, ?, ?, ?)
  `;
  const [result] = await db.execute(sql, [name, username, password_hash, role, unit_id]);
  return result.insertId;
}

module.exports = {
  findByUsername,
  findById,
  createUser,
};