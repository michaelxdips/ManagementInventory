const db = require('../db/mysql');

const rangeClause = (from, to, column = 'tanggal') => {
  const clauses = [];
  const params = [];
  if (from) {
    clauses.push(`${column} >= ?`);
    params.push(from);
  }
  if (to) {
    clauses.push(`${column} <= ?`);
    params.push(to);
  }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  return { where, params };
};

async function listMasuk({ from, to }) {
  const { where, params } = rangeClause(from, to, 'bm.tanggal');
  const sql = `
    SELECT bm.id, bm.tanggal AS date, ai.nama AS name, ai.kode_barang AS code,
           bm.jumlah AS qty, bm.satuan AS unit, bm.pic
    FROM barang_masuk bm
    JOIN atk_items ai ON ai.id = bm.atk_item_id
    ${where}
    ORDER BY bm.tanggal DESC, bm.id DESC
  `;
  const [rows] = await db.execute(sql, params);
  return rows;
}

async function listKeluar({ from, to }) {
  const { where, params } = rangeClause(from, to, 'bk.tanggal');
  const sql = `
    SELECT bk.id, bk.tanggal AS date, ai.nama AS name, ai.kode_barang AS code,
           bk.jumlah AS qty, bk.satuan AS unit, bk.penerima AS receiver, bk.unit_id AS dept
    FROM barang_keluar bk
    JOIN atk_items ai ON ai.id = bk.atk_item_id
    ${where}
    ORDER BY bk.tanggal DESC, bk.id DESC
  `;
  const [rows] = await db.execute(sql, params);
  return rows;
}

module.exports = {
  listMasuk,
  listKeluar,
};