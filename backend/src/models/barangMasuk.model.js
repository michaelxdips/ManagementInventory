const db = require("../db/mysql");

async function insertBarangMasuk({ atk_item_id, jumlah, tanggal, satuan = null, pic = null }, executor = db) {
  const sql = `
    INSERT INTO barang_masuk (atk_item_id, jumlah, tanggal, satuan, pic)
    VALUES (?, ?, ?, ?, ?)
  `;
  await executor.execute(sql, [atk_item_id, jumlah, tanggal, satuan, pic]);
}

async function tambahStok({ atk_item_id, jumlah }, executor = db) {
  const sql = `
    UPDATE atk_items
    SET stok = stok + ?
    WHERE id = ?
  `;
  await executor.execute(sql, [jumlah, atk_item_id]);
}

module.exports = {
  insertBarangMasuk,
  tambahStok,
};
