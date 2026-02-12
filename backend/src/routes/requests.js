import { Router } from 'express';
import pool from '../config/db.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// GET /api/requests - List requests
router.get('/', authenticate, async (req, res) => {
    try {
        let query = `
      SELECT 
        id,
        date,
        item,
        qty,
        unit,
        receiver,
        dept,
        status
      FROM requests
    `;
        const params = [];

        // If user role, only show their own requests
        if (req.user.role === 'user') {
            query += ' WHERE user_id = ?';
            params.push(req.user.id);
        }

        query += ' ORDER BY created_at DESC';

        const [requests] = await pool.query(query, params);
        res.json(requests);
    } catch (error) {
        console.error('Get requests error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// POST /api/requests - Create new request
router.post('/', authenticate, authorize('user', 'admin', 'superadmin'), async (req, res) => {
    try {
        const { date, item, qty, unit, receiver, dept } = req.body;

        if (!date || !item || !qty || !unit || !receiver || !dept) {
            return res.status(400).json({ message: 'Semua field wajib diisi' });
        }

        if (qty <= 0) {
            return res.status(400).json({ message: 'Jumlah permintaan harus lebih dari 0' });
        }

        // FIX: Validate item exists in inventory (Case Insensitive) AND use correct name
        const [itemRows] = await pool.query('SELECT nama_barang, satuan FROM atk_items WHERE LOWER(nama_barang) = LOWER(?)', [item]);

        if (itemRows.length === 0) {
            return res.status(400).json({
                message: `Barang "${item}" tidak ditemukan di database. Pastikan nama barang sesuai katalog.`
            });
        }

        const validItemName = itemRows[0].nama_barang;

        // Validate dept exists as a registered unit
        const [deptRows] = await pool.query('SELECT id FROM users WHERE name = ? AND role = ?', [dept, 'user']);
        if (deptRows.length === 0) {
            return res.status(400).json({
                message: `Unit "${dept}" tidak terdaftar di sistem.`
            });
        }

        const [result] = await pool.execute(`
      INSERT INTO requests (date, item, qty, unit, receiver, dept, status, user_id)
      VALUES (?, ?, ?, ?, ?, ?, 'PENDING', ?)
    `, [date, validItemName, qty, unit, receiver, dept, req.user.id]);

        const [newRows] = await pool.query('SELECT * FROM requests WHERE id = ?', [result.insertId]);
        res.status(201).json(newRows[0]);
    } catch (error) {
        console.error('Create request error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET /api/requests/:id - Get single request
router.get('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;

        let query = 'SELECT * FROM requests WHERE id = ?';
        const params = [id];

        // If user role, only allow viewing their own requests
        if (req.user.role === 'user') {
            query += ' AND user_id = ?';
            params.push(req.user.id);
        }

        const [rows] = await pool.query(query, params);
        const request = rows[0];

        if (!request) {
            return res.status(404).json({ message: 'Request tidak ditemukan' });
        }

        res.json(request);
    } catch (error) {
        console.error('Get request error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
