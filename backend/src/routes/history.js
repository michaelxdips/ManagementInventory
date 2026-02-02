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

// GET /api/history/user - Get user's own history (for Information page)
router.get('/user', authenticate, async (req, res) => {
    try {
        const { from, to } = req.query;

        let query = `
      SELECT 
        bk.id,
        bk.date,
        bk.nama_barang as name,
        bk.kode_barang as code,
        bk.qty,
        bk.satuan as unit,
        bk.penerima as receiver,
        bk.dept
      FROM barang_keluar bk
      WHERE bk.dept = ?
    `;
        const params = [req.user.name];

        if (from) {
            query += ' AND bk.date >= ?';
            params.push(from);
        }
        if (to) {
            query += ' AND bk.date <= ?';
            params.push(to);
        }

        query += ' ORDER BY bk.date DESC, bk.id DESC';

        const [entries] = await pool.query(query, params);
        res.json(entries);
    } catch (error) {
        console.error('Get user history error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
