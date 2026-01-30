const {
  insertBarangKeluar,
  kurangiStok,
} = require("../models/barangKeluar.model");
const { getItemById } = require("../models/atkItem.model");
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

async function takeItem(req, res) {
  const { atk_item_id, qty, penerima } = req.body;
  const userId = req.user?.id;
  const userName = req.user?.name;

  console.log('[TAKE_ITEM] Menerima request:', { atk_item_id, qty, penerima, userName });

  if (!atk_item_id || !qty || qty <= 0) {
    return res.status(400).json({ message: 'Item ID dan jumlah harus valid' });
  }

  if (!penerima || !penerima.trim()) {
    console.log('[TAKE_ITEM] Error: penerima kosong');
    return res.status(400).json({ message: 'Penerima tidak boleh kosong' });
  }

  let conn;
  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    // Get item to check stock
    const item = await getItemById(atk_item_id, conn);
    if (!item) {
      await conn.rollback();
      return res.status(404).json({ message: 'Barang tidak ditemukan' });
    }

    if (item.stok < qty) {
      await conn.rollback();
      return res.status(400).json({ message: 'Stok tidak cukup' });
    }

    // Reduce stock
    const affected = await kurangiStok({ atk_item_id, jumlah: qty }, conn);
    if (affected === 0) {
      await conn.rollback();
      return res.status(400).json({ message: 'Gagal mengurangi stok' });
    }

    // Record barang keluar
    const tanggalHari = new Date().toISOString().split('T')[0];
    console.log(`[TAKE_ITEM] Recording barang keluar:`, {
      atk_item_id,
      jumlah: qty,
      tanggal: tanggalHari,
      penerima: penerima.trim(),
      satuan: item.satuan,
    });
    await insertBarangKeluar({
      atk_item_id,
      jumlah: qty,
      tanggal: tanggalHari,
      penerima: penerima.trim(),
      unit_id: null,
      pic: null,
      satuan: item.satuan,
    }, conn);
    console.log(`[TAKE_ITEM] Barang keluar recorded successfully`);

    await conn.commit();

    res.json({
      message: 'Barang berhasil diambil',
      item: {
        id: item.id,
        name: item.nama,
        qty,
        unit: item.satuan,
      },
    });
  } catch (error) {
    console.error('[TAKE_ITEM] Error:', error);
    if (conn) {
      try {
        await conn.rollback();
      } catch (rollbackErr) {
        console.error('Rollback gagal', rollbackErr);
      }
    }
    res.status(500).json({ message: 'Gagal mengambil barang' });
  } finally {
    if (conn) conn.release();
  }
}

module.exports = {
  createBarangKeluar,
  takeItem,
};
