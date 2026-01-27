const db = require("../db/mysql");

// Normalize item names to improve matching against user-entered text
function normalizeName(value) {
  return (value || "")
    .toString()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

// ambil semua item
async function getAllItems() {
  const sql = `
    SELECT id, nama, stok, satuan, kode_barang, lokasi_simpan
    FROM atk_items
    ORDER BY nama ASC
  `;
  const [rows] = await db.execute(sql);
  return rows;
}

// ambil item by id (untuk edit)
async function getItemById(id) {
  const sql = `
    SELECT id, nama, stok, satuan, kode_barang, lokasi_simpan
    FROM atk_items
    WHERE id = ?
  `;
  const [rows] = await db.execute(sql, [id]);
  return rows[0];
}

async function getItemByName(name) {
  const sql = `
    SELECT id, nama, stok, satuan, kode_barang, lokasi_simpan
    FROM atk_items
    WHERE nama = ?
    LIMIT 1
  `;
  const [rows] = await db.execute(sql, [name]);
  return rows[0];
}

// Try to find an item even if the name has different casing or spacing.
// This helps approvals when requests were typed manually instead of selected from a list.
async function getItemByLooseName(name) {
  if (!name) return null;
  const normalizedTarget = normalizeName(name);
  const sql = `
    SELECT id, nama, stok, satuan, kode_barang, lokasi_simpan
    FROM atk_items
  `;
  const [rows] = await db.execute(sql);

  // Prefer exact normalized match, otherwise fall back to contains match.
  const exact = rows.find((row) => normalizeName(row.nama) === normalizedTarget);
  if (exact) return exact;
  return rows.find((row) => normalizeName(row.nama).includes(normalizedTarget)) || null;
}

// tambah item baru, kembalikan insertId
async function insertItem({ nama, stok, satuan, kode_barang = null, lokasi_simpan = null }, executor = db) {
  const sql = `
    INSERT INTO atk_items (nama, stok, satuan, kode_barang, lokasi_simpan)
    VALUES (?, ?, ?, ?, ?)
  `;
  const [result] = await executor.execute(sql, [nama, stok, satuan, kode_barang, lokasi_simpan]);
  return result.insertId;
}

// update item
async function updateItem(id, { nama, satuan, stok, kode_barang = null, lokasi_simpan = null }, executor = db) {
  const sql = `
    UPDATE atk_items
    SET nama = ?, satuan = ?, stok = ?, kode_barang = ?, lokasi_simpan = ?
    WHERE id = ?
  `;
  const [result] = await executor.execute(sql, [nama, satuan, stok, kode_barang, lokasi_simpan, id]);
  return result.affectedRows;
}

module.exports = {
  getAllItems,
  getItemById,
  insertItem,
  updateItem,
  getItemByName,
  getItemByLooseName,
};
