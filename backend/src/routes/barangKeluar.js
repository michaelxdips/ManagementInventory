import { Router } from 'express';
import db from '../config/db.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// POST /api/barang-keluar/take - Take item (reduce stock)
router.post('/take', authenticate, authorize('admin', 'superadmin'), (req, res) => {
    try {
        const { atk_item_id, qty, penerima } = req.body;

        if (!atk_item_id || !qty || !penerima) {
            return res.status(400).json({ message: 'Item ID, qty, dan penerima wajib diisi' });
        }

        // Get the item
        const item = db.prepare('SELECT * FROM atk_items WHERE id = ?').get(atk_item_id);
        if (!item) {
            return res.status(404).json({ message: 'Item tidak ditemukan' });
        }

        // Check stock
        if (item.qty < qty) {
            return res.status(400).json({ message: `Stok tidak cukup. Tersedia: ${item.qty}` });
        }

        // Reduce stock
        const newQty = item.qty - qty;
        db.prepare('UPDATE atk_items SET qty = ? WHERE id = ?').run(newQty, atk_item_id);

        // Record barang keluar
        const today = new Date().toISOString().split('T')[0];
        db.prepare(`
      INSERT INTO barang_keluar (date, atk_item_id, nama_barang, kode_barang, qty, satuan, penerima, dept)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(today, atk_item_id, item.nama_barang, item.kode_barang, qty, item.satuan, penerima, null);

        // Stock is now 0 - barang_kosong is derived from atk_items WHERE qty=0
        // No separate table insert needed (single source of truth)

        res.json({
            message: 'Barang berhasil diambil',
            newStock: newQty
        });
    } catch (error) {
        console.error('Take item error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
