import db from '../config/db.js';

export const getAllItems = (req, res) => {
    try {
        const items = db.prepare('SELECT * FROM atk_items ORDER BY nama_barang ASC').all();
        res.json(items);
    } catch (error) {
        console.error('Get items error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getItemById = (req, res) => {
    try {
        const { id } = req.params;
        const item = db.prepare('SELECT * FROM atk_items WHERE id = ?').get(id);

        if (!item) {
            return res.status(404).json({ message: 'Item tidak ditemukan' });
        }

        res.json(item);
    } catch (error) {
        console.error('Get item error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateItem = (req, res) => {
    try {
        const { id } = req.params;
        const { nama_barang, kode_barang, qty, satuan, lokasi_simpan } = req.body;

        // Check if item exists
        const existing = db.prepare('SELECT * FROM atk_items WHERE id = ?').get(id);
        if (!existing) {
            return res.status(404).json({ message: 'Item tidak ditemukan' });
        }

        // FIX #1: Prevent negative stock
        if (typeof qty === 'number' && qty < 0) {
            return res.status(400).json({ message: 'Quantity cannot be negative' });
        }

        // FIX #2: Lock edit qty saat ada pending request
        if (typeof qty === 'number' && qty !== existing.qty) {
            const pendingCount = db.prepare(`
                SELECT COUNT(*) as count 
                FROM requests 
                WHERE LOWER(item) = LOWER(?) AND status = 'PENDING'
            `).get(existing.nama_barang);

            if (pendingCount && pendingCount.count > 0) {
                return res.status(409).json({
                    message: 'Item cannot be edited while there are pending requests'
                });
            }
        }

        // Update item
        const stmt = db.prepare(`
            UPDATE atk_items 
            SET nama_barang = ?, kode_barang = ?, qty = ?, satuan = ?, lokasi_simpan = ?
            WHERE id = ?
        `);
        stmt.run(nama_barang, kode_barang, qty, satuan, lokasi_simpan, id);

        // Get updated item
        const updated = db.prepare('SELECT * FROM atk_items WHERE id = ?').get(id);
        res.json(updated);
    } catch (error) {
        console.error('Update item error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const createItem = (req, res) => {
    try {
        const { nama_barang, kode_barang, qty, satuan, lokasi_simpan } = req.body;

        if (!nama_barang || !satuan) {
            return res.status(400).json({ message: 'Nama barang dan satuan wajib diisi' });
        }

        // FIX #1: Prevent negative stock on create
        const safeQty = (typeof qty === 'number' && qty >= 0) ? qty : 0;

        const result = db.prepare(`
            INSERT INTO atk_items (nama_barang, kode_barang, qty, satuan, lokasi_simpan)
            VALUES (?, ?, ?, ?, ?)
        `).run(nama_barang, kode_barang || null, safeQty, satuan, lokasi_simpan || null);

        const newItem = db.prepare('SELECT * FROM atk_items WHERE id = ?').get(result.lastInsertRowid);
        res.status(201).json(newItem);
    } catch (error) {
        console.error('Create item error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
