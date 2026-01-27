const { listApprovals, setStatus, findById } = require('../models/approvals.model');
const { updateStatus } = require('../models/requests.model');
const { getItemByName, getItemByLooseName } = require('../models/atkItem.model');
const { insertBarangKeluar, kurangiStok } = require('../models/barangKeluar.model');
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
    const record = await findById(id);
    if (!record) return res.status(404).json({ message: 'Data tidak ditemukan' });
    if (record.status !== 'pending') {
      return res.status(400).json({ message: 'Approval hanya untuk status pending' });
    }

    // Map request item (string) to master ATK item by name
    const item = (await getItemByName(record.item)) || (await getItemByLooseName(record.item));
    if (!item) {
      return res.status(400).json({ message: 'Item tidak ditemukan di master ATK' });
    }

    conn = await db.getConnection();
    await conn.beginTransaction();

    // Check and reduce stock atomically
    const affected = await kurangiStok({ atk_item_id: item.id, jumlah: record.qty }, conn);
    if (affected === 0) {
      await conn.rollback();
      return res.status(400).json({ message: 'Stok tidak cukup untuk menyetujui request' });
    }

    // Insert barang keluar transaction to appear in history
    await insertBarangKeluar({
      atk_item_id: item.id,
      jumlah: record.qty,
      tanggal: record.date,
      penerima: record.receiver,
      unit_id: null,
      pic: null,
      satuan: record.unit,
    }, conn);

    await setStatus({ id, status: 'approved', decided_by: req.user?.id || null }, conn);
    await updateStatus(record.request_id, 'finished', conn);

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
      status: 'approved',
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
