const { listMasuk, listKeluar } = require('../models/history.model');

exports.listMasuk = async (req, res) => {
  const { from, to } = req.query;
  try {
    const rows = await listMasuk({ from, to });
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil riwayat barang masuk' });
  }
};

exports.listKeluar = async (req, res) => {
  const { from, to } = req.query;
  try {
    const rows = await listKeluar({ from, to });
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil riwayat barang keluar' });
  }
};

// noop placeholders kept for backward compatibility with callers
exports.addMasuk = () => {};
exports.addKeluar = () => {};
