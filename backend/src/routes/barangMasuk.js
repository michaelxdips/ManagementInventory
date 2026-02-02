import { Router } from 'express';
import db from '../config/db.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// GET /api/barang-masuk - Get barang masuk history (same as history/masuk)
router.get('/', authenticate, authorize('admin', 'superadmin'), (req, res) => {
    try {
        const { from, to } = req.query;

        let query = `
            SELECT 
                id,
                date,
                nama_barang as name,
                kode_barang as code,
                qty,
                satuan as unit,
                lokasi_simpan as location,
                pic
            FROM barang_masuk
        `;
        const params = [];

        if (from || to) {
            const conditions = [];
            if (from) {
                conditions.push('date >= ?');
                params.push(from);
            }
            if (to) {
                conditions.push('date <= ?');
                params.push(to);
            }
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY date DESC, id DESC';

        const entries = db.prepare(query).all(...params);
        res.json(entries);
    } catch (error) {
        console.error('Get barang masuk error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// POST /api/barang-masuk - Add new stock (Barang Masuk)
router.post('/', authenticate, authorize('admin', 'superadmin'), (req, res) => {
    try {
        const { nama_barang, kode_barang, qty, satuan, lokasi_simpan, tanggal } = req.body;

        if (!nama_barang || !qty || !satuan) {
            return res.status(400).json({ message: 'Nama barang, jumlah, dan satuan wajib diisi' });
        }

        if (qty <= 0) {
            return res.status(400).json({ message: 'Jumlah harus lebih dari 0' });
        }

        const date = tanggal || new Date().toISOString().split('T')[0];

        // Find or create item in inventory
        let item = db.prepare('SELECT * FROM atk_items WHERE LOWER(nama_barang) = LOWER(?)').get(nama_barang);

        if (item) {
            // Update existing item - ADD stock
            db.prepare(`
                UPDATE atk_items 
                SET qty = qty + ?, 
                    kode_barang = COALESCE(?, kode_barang), 
                    lokasi_simpan = COALESCE(?, lokasi_simpan)
                WHERE id = ?
            `).run(qty, kode_barang, lokasi_simpan, item.id);

            // barang_kosong is derived from atk_items WHERE qty=0
            // No maintenance needed
        } else {
            // Create new item
            const result = db.prepare(`
                INSERT INTO atk_items (nama_barang, kode_barang, qty, satuan, lokasi_simpan)
                VALUES (?, ?, ?, ?, ?)
            `).run(nama_barang, kode_barang || null, qty, satuan, lokasi_simpan || null);
            item = { id: result.lastInsertRowid };
        }

        // Record barang masuk
        db.prepare(`
            INSERT INTO barang_masuk (date, atk_item_id, nama_barang, kode_barang, qty, satuan, lokasi_simpan, pic)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(date, item.id, nama_barang, kode_barang || null, qty, satuan, lokasi_simpan || null, req.user.name);

        res.status(201).json({
            message: `Barang masuk berhasil dicatat: ${nama_barang} (+${qty} ${satuan})`,
            item: {
                nama_barang,
                kode_barang,
                qty,
                satuan,
                lokasi_simpan,
                date,
                pic: req.user.name
            }
        });
    } catch (error) {
        console.error('Create barang masuk error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
