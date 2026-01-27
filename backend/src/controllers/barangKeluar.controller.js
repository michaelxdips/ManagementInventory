const {
  insertBarangKeluar,
  kurangiStok,
} = require("../models/barangKeluar.model");
const { addKeluar } = require('./history.controller');
const db = require("../db/mysql");

async function createBarangKeluar(req, res) {
  const {
    atk_item_id,
    qty,
    tanggal,
    penerima,
    unit_id,
    pic,
    satuan,
  } = req.body;

  // validasi minimal
  if (!atk_item_id || qty === undefined || !tanggal) {
    return res.status(400).json({
      message: "Data tidak lengkap",
    });
  }

  if (Number(qty) <= 0) {
    return res.status(400).json({ message: "Jumlah harus lebih dari 0" });
  }

  let conn;
  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    const affected = await kurangiStok({ atk_item_id, jumlah: qty }, conn);

    if (affected === 0) {
      await conn.rollback();
      return res.status(400).json({
        message: "Stok tidak cukup atau item tidak ditemukan",
      });
    }

    await insertBarangKeluar({
      atk_item_id,
      jumlah: qty,
      tanggal,
      penerima,
      unit_id,
      pic,
      satuan,
    }, conn);

    await conn.commit();

    addKeluar({
      date: tanggal,
      name: undefined,
      code: undefined,
      qty,
      unit: satuan,
      receiver: penerima,
      dept: unit_id,
    });

    res.status(201).json({
      message: "Barang keluar berhasil dicatat",
    });
  } catch (error) {
    console.error(error);
    if (conn) {
      try {
        await conn.rollback();
      } catch (rollbackErr) {
        console.error("Rollback gagal", rollbackErr);
      }
    }
    res.status(500).json({
      message: "Terjadi kesalahan server",
    });
  } finally {
    if (conn) conn.release();
  }
}

module.exports = {
  createBarangKeluar,
};
