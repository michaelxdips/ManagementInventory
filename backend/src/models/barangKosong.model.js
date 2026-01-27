const db = require('../db/mysql');

async function listKosong() {
  const sql = `
    SELECT id, nama, kode_barang, lokasi_simpan
    FROM barang_kosong
    ORDER BY nama ASC
  `;
  const [rows] = await db.execute(sql);
  return rows;
}

async function createKosong({ nama, kode_barang = null, lokasi_simpan = null }) {
  const sql = `
    INSERT INTO barang_kosong (nama, kode_barang, lokasi_simpan)
    VALUES (?, ?, ?)
  `;
  const [result] = await db.execute(sql, [nama, kode_barang, lokasi_simpan]);
  return result.insertId;
}

module.exports = {
  listKosong,
  createKosong,
};