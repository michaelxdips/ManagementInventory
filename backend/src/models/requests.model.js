const db = require('../db/mysql');

const baseSelect = `
  SELECT id, date, item, qty, unit, receiver, dept, status, created_at
  FROM requests
`;

async function listRequests(executor = db) {
  const [rows] = await executor.execute(`${baseSelect} ORDER BY created_at DESC`);
  return rows;
}

async function createRequest({ date, item, qty, unit, receiver, dept }, executor = db) {
  const sql = `
    INSERT INTO requests (date, item, qty, unit, receiver, dept, status)
    VALUES (?, ?, ?, ?, ?, ?, 'pending')
  `;
  const [result] = await executor.execute(sql, [date, item, qty, unit, receiver, dept]);
  return result.insertId;
}

async function updateStatus(id, status, executor = db) {
  const [result] = await executor.execute(`UPDATE requests SET status = ? WHERE id = ?`, [status, id]);
  return result.affectedRows;
}

async function findById(id, executor = db) {
  const [rows] = await executor.execute(`${baseSelect} WHERE id = ? LIMIT 1`, [id]);
  return rows[0] || null;
}

module.exports = {
  listRequests,
  createRequest,
  updateStatus,
  findById,
};