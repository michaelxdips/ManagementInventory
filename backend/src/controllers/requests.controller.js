const { listRequests, createRequest } = require('../models/requests.model');
const { createApproval } = require('../models/approvals.model');

exports.index = async (_req, res) => {
  try {
    const rows = await listRequests();
    // normalize status to uppercase so frontend can map consistently
    const mapped = rows.map((r) => ({ ...r, status: normalizeStatus(r.status) }));
    res.json(mapped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil data request' });
  }
};

exports.store = async (req, res) => {
  const { date, item, qty, unit, receiver, dept } = req.body || {};
  if (!date || !item || qty === undefined || !unit || !receiver || !dept) {
    return res.status(400).json({ message: 'Data tidak lengkap' });
  }
  try {
    const requestId = await createRequest({ date, item, qty: Number(qty), unit, receiver, dept });
    await createApproval(requestId);
    res.status(201).json({
      id: requestId,
      date,
      item,
      qty: Number(qty),
      unit,
      receiver,
      dept,
      status: 'PENDING',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal membuat request' });
  }
};

function normalizeStatus(val) {
  if (!val) return val;
  const status = val.toString().toLowerCase();
  if (status === 'pending') return 'PENDING';
  if (status === 'approved') return 'APPROVED';
  if (status === 'rejected') return 'REJECTED';
  if (status === 'finished') return 'FINISHED';
  return status.toUpperCase();
}
