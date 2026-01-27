const db = require('../db/mysql');

const baseSelect = `
  SELECT a.id, a.request_id, a.status, a.decided_by, a.decided_at, a.note,
         r.date, r.item, r.qty, r.unit, r.receiver, r.dept
  FROM approvals a
  JOIN requests r ON r.id = a.request_id
`;

async function listApprovals(executor = db) {
  const [rows] = await executor.execute(`${baseSelect} ORDER BY a.id DESC`);
  return rows;
}

async function createApproval(request_id, executor = db) {
  const sql = `INSERT INTO approvals (request_id, status) VALUES (?, 'pending')`;
  const [result] = await executor.execute(sql, [request_id]);
  return result.insertId;
}

async function setStatus({ id, status, decided_by = null, note = null }, executor = db) {
  const sql = `
    UPDATE approvals
    SET status = ?, decided_by = ?, decided_at = NOW(), note = ?
    WHERE id = ?
  `;
  const [result] = await executor.execute(sql, [status, decided_by, note, id]);
  return result.affectedRows;
}

async function findById(id, executor = db) {
  const [rows] = await executor.execute(`${baseSelect} WHERE a.id = ? LIMIT 1`, [id]);
  return rows[0] || null;
}

module.exports = {
  listApprovals,
  createApproval,
  setStatus,
  findById,
};