const { listApprovals, setStatus, findById } = require('../models/approvals.model');
const { updateStatus } = require('../models/requests.model');
const { getItemByName, getItemByLooseName, insertItem } = require('../models/atkItem.model');
const { insertBarangKeluar, kurangiStok } = require('../models/barangKeluar.model');
const { insertBarangMasuk, tambahStok } = require('../models/barangMasuk.model');
const db = require('../db/mysql');

exports.index = async (_req, res) => {
  try {
    const rows = await listApprovals();
    const mapped = rows.map((r) => ({
      id: r.id,
      date: r.date,
      name: r.item,
      code: '',
      qty: r.qty,
      unit: r.unit,
      receiver: r.receiver,
      dept: r.dept,
      status: r.status,
    }));
    res.json(mapped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil data approval' });
  }
};

exports.approve = async (req, res) => {
  const id = Number(req.params.id);
  let conn;
  try {
    console.log(`[APPROVE] Starting approve for approval ID: ${id}`);
    const record = await findById(id);
    console.log(`[APPROVE] Found record:`, record);
    if (!record) return res.status(404).json({ message: 'Data tidak ditemukan' });
    if (record.status !== 'pending') {
      return res.status(400).json({ message: 'Approval hanya untuk status pending' });
    }

    conn = await db.getConnection();
    await conn.beginTransaction();

    // Only update status to approved, don't process barang masuk/keluar yet
    console.log(`[APPROVE] Updating approval status...`);
    await setStatus({ id, status: 'approved', decided_by: req.user?.id || null }, conn);
    console.log(`[APPROVE] Updating request status...`);
    await updateStatus(record.request_id, 'approved', conn);

    await conn.commit();
    console.log(`[APPROVE] Transaction committed successfully`);

    res.json({
      id,
      date: record.date,
      name: record.item,
      code: '',
      qty: record.qty,
      unit: record.unit,
      receiver: record.receiver,
      dept: record.dept,
      status: 'approved',
    });
  } catch (err) {
    console.error(`[APPROVE] Error:`, err);
    if (conn) {
      try {
        await conn.rollback();
      } catch (rollbackErr) {
        console.error('Rollback gagal', rollbackErr);
      }
    }
    res.status(500).json({ message: 'Gagal menyetujui request' });
  } finally {
    if (conn) conn.release();
  }
};

exports.reject = async (req, res) => {
  const id = Number(req.params.id);
  let conn;
  try {
    const record = await findById(id);
    if (!record) return res.status(404).json({ message: 'Data tidak ditemukan' });
    if (record.status !== 'pending') {
      return res.status(400).json({ message: 'Approval hanya untuk status pending' });
    }

    conn = await db.getConnection();
    await conn.beginTransaction();

    await setStatus({ id, status: 'rejected', decided_by: req.user?.id || null }, conn);
    await updateStatus(record.request_id, 'rejected', conn);

    await conn.commit();

    res.json({
      id,
      date: record.date,
      name: record.item,
      code: '',
      qty: record.qty,
      unit: record.unit,
      receiver: record.receiver,
      dept: record.dept,
      status: 'rejected',
    });
  } catch (err) {
    console.error(err);
    if (conn) {
      try {
        await conn.rollback();
      } catch (rollbackErr) {
        console.error('Rollback gagal', rollbackErr);
      }
    }
    res.status(500).json({ message: 'Gagal menolak request' });
  } finally {
    if (conn) conn.release();
  }
};

exports.completeBarangMasuk = async (req, res) => {
  const { approval_id, kode_barang, lokasi_simpan, qty, satuan, tanggal } = req.body;

  // Validate required fields
  if (!approval_id || !kode_barang || !lokasi_simpan || qty === undefined || !satuan || !tanggal) {
    return res.status(400).json({ message: 'Data tidak lengkap' });
  }

  let conn;
  try {
    // Find the approval record
    const approval = await findById(approval_id);
    if (!approval) {
      return res.status(404).json({ message: 'Approval tidak ditemukan' });
    }
    if (approval.status !== 'approved') {
      return res.status(400).json({ message: 'Hanya approval yang sudah disetujui yang bisa dilengkapi' });
    }

    conn = await db.getConnection();
    await conn.beginTransaction();

    // Try to find existing item by name first
    let item = (await getItemByName(approval.item)) || (await getItemByLooseName(approval.item));
    
    // If item doesn't exist, create it
    if (!item) {
      const itemId = await insertItem({
        nama: approval.item,
        stok: 0,
        satuan,
        kode_barang,
        lokasi_simpan,
      }, conn);
      item = { id: itemId };
    }

    // Add stock to the item
    await tambahStok({ atk_item_id: item.id, jumlah: qty }, conn);

    // Record barang masuk
    await insertBarangMasuk({
      atk_item_id: item.id,
      jumlah: qty,
      tanggal,
      satuan,
      pic: req.user?.name || 'System',
    }, conn);

    // Insert barang keluar (untuk diberikan ke penerima)
    await insertBarangKeluar({
      atk_item_id: item.id,
      jumlah: qty,
      tanggal,
      penerima: approval.receiver,
      unit_id: null,
      pic: req.user?.name || 'System',
      satuan,
    }, conn);

    // Update approval status to 'finished'
    await setStatus({ id: approval_id, status: 'finished', decided_by: req.user?.id || null }, conn);
    await updateStatus(approval.request_id, 'finished', conn);

    await conn.commit();

    res.status(201).json({
      message: 'Barang masuk berhasil dicatat dan diberikan ke penerima',
      approval_id,
    });
  } catch (error) {
    console.error(error);
    if (conn) {
      try {
        await conn.rollback();
      } catch (rollbackErr) {
        console.error('Rollback gagal', rollbackErr);
      }
    }
    res.status(500).json({ message: 'Gagal mencatat barang masuk' });
  } finally {
    if (conn) conn.release();
  }
};
