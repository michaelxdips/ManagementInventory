const db = require("../db/mysql");

async function insertBarangKeluar({ atk_item_id, jumlah, tanggal, penerima = null, unit_id = null, pic = null, satuan = null }, executor = db) {
  const sql = `
    INSERT INTO barang_keluar (atk_item_id, jumlah, tanggal, penerima, unit_id, pic, satuan)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  await executor.execute(sql, [atk_item_id, jumlah, tanggal, penerima, unit_id, pic, satuan]);
}

async function kurangiStok({ atk_item_id, jumlah }, executor = db) {
  const sql = `
    UPDATE atk_items
    SET stok = stok - ?
    WHERE id = ? AND stok >= ?
  `;
  const [result] = await executor.execute(sql, [jumlah, atk_item_id, jumlah]);
  return result.affectedRows;
}

module.exports = {
  insertBarangKeluar,
  kurangiStok,
};
