import pool from '../config/db.js';

export const getAllItems = async (req, res) => {
    try {
        const [items] = await pool.query('SELECT * FROM atk_items ORDER BY nama_barang ASC');
        res.json(items);
    } catch (error) {
        console.error('Get items error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getItemById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query('SELECT * FROM atk_items WHERE id = ?', [id]);
        const item = rows[0];

        if (!item) {
            return res.status(404).json({ message: 'Item tidak ditemukan' });
        }

        res.json(item);
    } catch (error) {
        console.error('Get item error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { nama_barang, kode_barang, qty, satuan, lokasi_simpan, min_stock } = req.body;

        // Check if item exists
        const [rows] = await pool.query('SELECT * FROM atk_items WHERE id = ?', [id]);
        const existing = rows[0];

        if (!existing) {
            return res.status(404).json({ message: 'Item tidak ditemukan' });
        }

        // FIX #1: Prevent negative stock
        if (typeof qty === 'number' && qty < 0) {
            return res.status(400).json({ message: 'Quantity cannot be negative' });
        }

        // FIX #2: Lock edit qty OR NAME saat ada pending request
        if ((typeof qty === 'number' && qty !== existing.qty) || (nama_barang && nama_barang !== existing.nama_barang)) {
            const [countRows] = await pool.query(`
                SELECT COUNT(*) as count 
                FROM requests 
                WHERE LOWER(item) = LOWER(?) AND (status = 'PENDING' OR status = 'APPROVAL_REVIEW')
            `, [existing.nama_barang]);

            const pendingCount = countRows[0];

            if (pendingCount && pendingCount.count > 0) {
                return res.status(409).json({
                    message: 'Item cannot be edited (qty/name) while there are pending or in-review requests. Reject/Approve them first.'
                });
            }
        }

        // Update item
        await pool.execute(`
            UPDATE atk_items 
            SET nama_barang = ?, kode_barang = ?, qty = ?, satuan = ?, lokasi_simpan = ?, min_stock = ?
            WHERE id = ?
        `, [nama_barang, kode_barang, qty, satuan, lokasi_simpan, min_stock !== undefined ? min_stock : existing.min_stock, id]);

        // Get updated item
        const [updatedRows] = await pool.query('SELECT * FROM atk_items WHERE id = ?', [id]);
        res.json(updatedRows[0]);
    } catch (error) {
        console.error('Update item error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const createItem = async (req, res) => {
    try {
        const { nama_barang, kode_barang, qty, satuan, lokasi_simpan, min_stock } = req.body;

        if (!nama_barang || !satuan) {
            return res.status(400).json({ message: 'Nama barang dan satuan wajib diisi' });
        }

        // FIX #1: Prevent negative stock on create
        const safeQty = (typeof qty === 'number' && qty >= 0) ? qty : 0;

        const [result] = await pool.execute(`
            INSERT INTO atk_items (nama_barang, kode_barang, qty, satuan, lokasi_simpan, min_stock)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [nama_barang, kode_barang || null, safeQty, satuan, lokasi_simpan || null, min_stock !== undefined ? min_stock : 5]);

        const [newRows] = await pool.query('SELECT * FROM atk_items WHERE id = ?', [result.insertId]);
        res.status(201).json(newRows[0]);
    } catch (error) {
        console.error('Create item error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
