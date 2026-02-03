import { Router } from 'express';
import pool from '../config/db.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// GET /api/history/masuk - Get barang masuk history
router.get('/masuk', authenticate, authorize('admin', 'superadmin'), async (req, res) => {
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

        const [entries] = await pool.query(query, params);
        res.json(entries);
    } catch (error) {
        console.error('Get history masuk error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET /api/history/keluar - Get barang keluar history (from approved requests)
router.get('/keluar', authenticate, authorize('admin', 'superadmin'), async (req, res) => {
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
        penerima as receiver,
        dept
      FROM barang_keluar
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

        const [entries] = await pool.query(query, params);
        res.json(entries);
    } catch (error) {
        console.error('Get history keluar error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET /api/history/user - Get user's own request history (APPROVED + REJECTED)
router.get('/user', authenticate, async (req, res) => {
    try {
        const { from, to } = req.query;

        let query = `
      SELECT 
        r.id,
        r.date,
        r.item as name,
        COALESCE(a.kode_barang, '') as code,
        r.qty,
        r.unit,
        r.receiver,
        r.dept,
        r.status
      FROM requests r
      LEFT JOIN atk_items a ON LOWER(r.item) = LOWER(a.nama_barang)
      WHERE r.user_id = ? AND r.status IN ('APPROVED', 'REJECTED')
    `;
        const params = [req.user.id];

        if (from) {
            query += ' AND r.date >= ?';
            params.push(from);
        }
        if (to) {
            query += ' AND r.date <= ?';
            params.push(to);
        }

        query += ' ORDER BY r.created_at DESC, r.id DESC';

        const [entries] = await pool.query(query, params);
        res.json(entries);
    } catch (error) {
        console.error('Get user history error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
