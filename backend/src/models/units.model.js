const db = require('../db/mysql');

async function listUnits() {
  const [rows] = await db.execute(
    `SELECT id, name, username, created_at FROM units ORDER BY name ASC`
  );
  return rows;
}

async function createUnit({ name, username }) {
  const sql = `INSERT INTO units (name, username) VALUES (?, ?)`;
  const [result] = await db.execute(sql, [name, username]);
  return result.insertId;
}

async function findByUsername(username) {
  const [rows] = await db.execute(`SELECT id FROM units WHERE username = ? LIMIT 1`, [username]);
  return rows[0] || null;
}

module.exports = {
  listUnits,
  createUnit,
  findByUsername,
};