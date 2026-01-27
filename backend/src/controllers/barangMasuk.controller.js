const {
  insertBarangMasuk,
  tambahStok,
} = require("../models/barangMasuk.model");
const { insertItem } = require("../models/atkItem.model");
const { addMasuk } = require('./history.controller');
const db = require("../db/mysql");

async function createBarangMasuk(req, res) {
  const {
    atk_item_id,
    nama_barang_baru,
    kode_barang_baru,
    lokasi_simpan_baru,
    tanggal,
    qty,
    satuan,
    pic,
  } = req.body;

  // validasi minimal: tanggal dan qty harus ada, lalu salah satu dari atk_item_id atau nama_barang_baru
  if (!tanggal || qty === undefined) {
    return res.status(400).json({
      message: "Data tidak lengkap",
    });
  }

  if (Number(qty) <= 0) {
    return res.status(400).json({ message: "Jumlah harus lebih dari 0" });
  }

  if (!atk_item_id && !nama_barang_baru) {
    return res.status(400).json({
      message: "Pilih barang atau isi barang baru",
    });
  }

  let conn;
  try {
    conn = await db.getConnection();
    let itemId = atk_item_id;

    await conn.beginTransaction();

    // Jika tidak pilih barang, buat item baru
    if (!itemId) {
      itemId = await insertItem({
        nama: nama_barang_baru,
        stok: 0,
        satuan,
        kode_barang: kode_barang_baru,
        lokasi_simpan: lokasi_simpan_baru,
      }, conn);
    }

    // tambah stok ke item (baik baru maupun lama) melalui transaksi
    await tambahStok({ atk_item_id: itemId, jumlah: qty }, conn);

    // catat log barang masuk
    await insertBarangMasuk({
      atk_item_id: itemId,
      jumlah: qty,
      tanggal,
      satuan,
      pic,
    }, conn);

    await conn.commit();

    // history dicatat setelah transaksi selesai
    addMasuk({
      date: tanggal,
      name: nama_barang_baru || undefined,
      code: kode_barang_baru || undefined,
      qty,
      unit: satuan,
      pic,
    });

    res.status(201).json({
      message: "Barang masuk berhasil dicatat",
      atk_item_id: itemId,
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
  createBarangMasuk,
};
