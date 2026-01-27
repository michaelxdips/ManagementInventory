const { listKosong, createKosong } = require('../models/barangKosong.model');

exports.index = async (_req, res) => {
  try {
    const rows = await listKosong();
    const mapped = rows.map((r) => ({
      id: r.id,
      name: r.nama,
      code: r.kode_barang,
      location: r.lokasi_simpan,
    }));
    res.json(mapped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil data barang kosong' });
  }
};

exports.store = async (req, res) => {
  const { name, code, location } = req.body || {};
  if (!name) return res.status(400).json({ message: 'Nama wajib diisi' });
  try {
    const id = await createKosong({ nama: name, kode_barang: code, lokasi_simpan: location });
    res.status(201).json({ id, name, code, location });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal menambah barang kosong' });
  }
};