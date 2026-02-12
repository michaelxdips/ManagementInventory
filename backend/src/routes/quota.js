import { Router } from 'express';
import pool from '../config/db.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// GET /api/quota - List all quotas with item and unit names
router.get('/', authenticate, authorize('admin', 'superadmin'), async (req, res) => {
    try {
        const [quotas] = await pool.query(`
            SELECT
                uq.id,
                uq.item_id,
                a.nama_barang as item_name,
                a.kode_barang as item_code,
                uq.unit_id,
                u.name as unit_name,
                uq.quota_max,
                uq.quota_used,
                (uq.quota_max - uq.quota_used) as quota_remaining
            FROM unit_quota uq
            JOIN atk_items a ON uq.item_id = a.id
            JOIN users u ON uq.unit_id = u.id
            ORDER BY a.nama_barang ASC, u.name ASC
        `);
        res.json(quotas);
    } catch (error) {
        console.error('Get quotas error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET /api/quota/items - List all items (for dropdown in quota form)
router.get('/items', authenticate, authorize('admin', 'superadmin'), async (req, res) => {
    try {
        const [items] = await pool.query('SELECT id, nama_barang as name, kode_barang as code FROM atk_items ORDER BY nama_barang ASC');
        res.json(items);
    } catch (error) {
        console.error('Get items for quota error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET /api/quota/units - List all units (for dropdown in quota form)
router.get('/units', authenticate, authorize('admin', 'superadmin'), async (req, res) => {
    try {
        const [units] = await pool.query("SELECT id, name FROM users WHERE role = 'user' ORDER BY name ASC");
        res.json(units);
    } catch (error) {
        console.error('Get units for quota error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// POST /api/quota - Create or update quota
router.post('/', authenticate, authorize('superadmin'), async (req, res) => {
    try {
        const { item_id, unit_id, quota_max } = req.body;

        if (!item_id || !unit_id || quota_max === undefined || quota_max === null) {
            return res.status(400).json({ message: 'item_id, unit_id, dan quota_max wajib diisi' });
        }

        if (parseInt(quota_max) < 0) {
            return res.status(400).json({ message: 'quota_max tidak boleh negatif' });
        }

        // Validate item exists
        const [itemRows] = await pool.query('SELECT id FROM atk_items WHERE id = ?', [item_id]);
        if (itemRows.length === 0) {
            return res.status(400).json({ message: 'Barang tidak ditemukan' });
        }

        // Validate unit exists
        const [unitRows] = await pool.query("SELECT id FROM users WHERE id = ? AND role = 'user'", [unit_id]);
        if (unitRows.length === 0) {
            return res.status(400).json({ message: 'Unit tidak ditemukan' });
        }

        // Upsert: insert or update if exists
        await pool.execute(`
            INSERT INTO unit_quota (item_id, unit_id, quota_max)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE quota_max = VALUES(quota_max)
        `, [item_id, unit_id, parseInt(quota_max)]);

        // Return the created/updated quota
        const [result] = await pool.query(`
            SELECT
                uq.id,
                uq.item_id,
                a.nama_barang as item_name,
                uq.unit_id,
                u.name as unit_name,
                uq.quota_max,
                uq.quota_used,
                (uq.quota_max - uq.quota_used) as quota_remaining
            FROM unit_quota uq
            JOIN atk_items a ON uq.item_id = a.id
            JOIN users u ON uq.unit_id = u.id
            WHERE uq.item_id = ? AND uq.unit_id = ?
        `, [item_id, unit_id]);

        res.status(201).json(result[0]);
    } catch (error) {
        console.error('Create/update quota error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// DELETE /api/quota/:id - Delete a quota
router.delete('/:id', authenticate, authorize('superadmin'), async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await pool.query('SELECT id FROM unit_quota WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Quota tidak ditemukan' });
        }

        await pool.execute('DELETE FROM unit_quota WHERE id = ?', [id]);
        res.status(204).send();
    } catch (error) {
        console.error('Delete quota error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
