const {
  getAllItems,
  getItemById,
  insertItem,
  updateItem,
} = require("../models/atkItem.model");

// GET /api/atk-items
async function index(req, res) {
  try {
    const items = await getAllItems();
    // sesuaikan nama field untuk kebutuhan frontend lama
    const mapped = items.map((item) => ({
      id: item.id,
      nama_barang: item.nama,
      kode_barang: item.kode_barang,
      qty: item.stok,
      satuan: item.satuan,
      lokasi_simpan: item.lokasi_simpan,
    }));
    res.json(mapped);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal mengambil data item" });
  }
}

// GET /api/atk-items/:id
async function show(req, res) {
  const { id } = req.params;

  try {
    const item = await getItemById(id);
    if (!item) {
      return res.status(404).json({ message: "Item tidak ditemukan" });
    }
    res.json({
      id: item.id,
      nama_barang: item.nama,
      kode_barang: item.kode_barang,
      qty: item.stok,
      satuan: item.satuan,
      lokasi_simpan: item.lokasi_simpan,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal mengambil data item" });
  }
}

// POST /api/atk-items
async function store(req, res) {
  const {
    nama_barang,
    kode_barang,
    qty,
    satuan,
    lokasi_simpan,
  } = req.body;

  if (!nama_barang || !satuan) {
    return res.status(400).json({
      message: "Data tidak lengkap",
    });
  }

  try {
    // stok awal selalu 0; penambahan stok wajib via transaksi barang masuk
    await insertItem({
      nama: nama_barang,
      stok: 0,
      satuan,
      kode_barang,
      lokasi_simpan,
    });
    res.status(201).json({
      message: "Item berhasil ditambahkan (stok awal 0, tambah via barang masuk)",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal menambah item" });
  }
}

// PUT /api/atk-items/:id
async function update(req, res) {
  const { id } = req.params;
  const {
    nama_barang,
    kode_barang,
    qty,
    satuan,
    lokasi_simpan,
  } = req.body;

  if (!nama_barang || !satuan) {
    return res.status(400).json({
      message: "Data tidak lengkap",
    });
  }

  try {
    const existing = await getItemById(id);
    if (!existing) {
      return res.status(404).json({
        message: "Item tidak ditemukan",
      });
    }

    // stok tidak boleh diubah lewat edit item
    const affected = await updateItem(id, {
      nama: nama_barang,
      satuan,
      stok: existing.stok,
      kode_barang,
      lokasi_simpan,
    });

    if (affected === 0) {
      return res.status(400).json({
        message: "Item gagal diperbarui",
      });
    }

    res.json({
      message: "Item berhasil diperbarui (stok tidak diubah di sini)",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal memperbarui item" });
  }
}

module.exports = {
  index,
  show,
  store,
  update,
};
