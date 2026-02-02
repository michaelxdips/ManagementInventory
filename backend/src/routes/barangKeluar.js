import { Router } from 'express';
import pool from '../config/db.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// POST /api/barang-keluar/take - Take item (reduce stock)
router.post('/take', authenticate, authorize('admin', 'superadmin'), async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { atk_item_id, qty, penerima } = req.body;

        if (!atk_item_id || !qty || !penerima) {
            connection.release();
            return res.status(400).json({ message: 'Item ID, qty, dan penerima wajib diisi' });
        }

        await connection.beginTransaction();

        // Get the item
        const [itemRows] = await connection.query('SELECT * FROM atk_items WHERE id = ? FOR UPDATE', [atk_item_id]);
        const item = itemRows[0];

        if (!item) {
            await connection.rollback();
            return res.status(404).json({ message: 'Item tidak ditemukan' });
        }

        // Check stock
        if (item.qty < qty) {
            await connection.rollback();
            return res.status(400).json({ message: `Stok tidak cukup. Tersedia: ${item.qty}` });
        }

        // Reduce stock
        const newQty = item.qty - qty;
        await connection.execute('UPDATE atk_items SET qty = ? WHERE id = ?', [newQty, atk_item_id]);

        // Record barang keluar
        const today = new Date().toISOString().split('T')[0];
        await connection.execute(`
      INSERT INTO barang_keluar (date, atk_item_id, nama_barang, kode_barang, qty, satuan, penerima, dept)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [today, atk_item_id, item.nama_barang, item.kode_barang, qty, item.satuan, penerima, null]);

        await connection.commit();

        res.json({
            message: 'Barang berhasil diambil',
            newStock: newQty
        });
    } catch (error) {
        await connection.rollback();
        console.error('Take item error:', error);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        connection.release();
    }
});

export default router;
