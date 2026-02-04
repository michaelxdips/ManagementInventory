import { Router } from 'express';
import pool from '../config/db.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { getWIBDate } from '../utils/date.js';

const router = Router();

// GET /api/approval - List PENDING requests only (for admin action)
router.get('/', authenticate, authorize('admin', 'superadmin'), async (req, res) => {
    try {
        const [requests] = await pool.query(`
      SELECT 
        r.id,
        r.date,
        r.item as name,
        COALESCE(a.kode_barang, '') as code,
        r.qty,
        r.unit,
        r.receiver,
        r.dept,
        LOWER(r.status) as status
      FROM requests r
      LEFT JOIN atk_items a ON LOWER(r.item) = LOWER(a.nama_barang)
      WHERE r.status = 'PENDING'
      ORDER BY r.created_at DESC
    `);

        res.json(requests);
    } catch (error) {
        console.error('Get approvals error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// POST /api/approval/:id/approve - Approve request, REDUCE stock, record barang keluar
router.post('/:id/approve', authenticate, authorize('admin', 'superadmin'), async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { id } = req.params;

        await connection.beginTransaction();

        // Step 1: Fetch request by ID (FOR UPDATE to lock row)
        const [reqRows] = await connection.query('SELECT * FROM requests WHERE id = ? FOR UPDATE', [id]);
        const request = reqRows[0];

        if (!request) {
            await connection.rollback();
            return res.status(404).json({ message: 'Request tidak ditemukan' });
        }

        // Step 2: STRICT status check to prevent double approval
        if (request.status !== 'PENDING') {
            await connection.rollback();
            return res.status(400).json({ message: 'Request sudah diproses sebelumnya' });
        }

        // Step 3: Find the item in inventory
        const [itemRows] = await connection.query('SELECT * FROM atk_items WHERE LOWER(nama_barang) = LOWER(?) FOR UPDATE', [request.item]);
        const item = itemRows[0];

        if (!item) {
            await connection.rollback();
            return res.status(400).json({ message: `Barang "${request.item}" tidak ditemukan di inventory` });
        }

        // Step 4: Re-validate stock availability
        if (item.qty < request.qty) {
            await connection.rollback();
            return res.status(400).json({
                message: `Stok tidak cukup. Tersedia: ${item.qty}, Diminta: ${request.qty}`
            });
        }

        const newQty = item.qty - request.qty;
        if (newQty < 0) {
            await connection.rollback();
            return res.status(400).json({ message: 'Quantity cannot be negative' });
        }

        // Step 5: Update request status to APPROVED
        await connection.execute('UPDATE requests SET status = ? WHERE id = ?', ['APPROVED', id]);

        // Step 6: REDUCE stock
        await connection.execute('UPDATE atk_items SET qty = ? WHERE id = ?', [newQty, item.id]);

        // Step 7: Record barang keluar
        const today = getWIBDate();
        await connection.execute(`
            INSERT INTO barang_keluar (date, atk_item_id, nama_barang, kode_barang, qty, satuan, penerima, dept)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [today, item.id, item.nama_barang, item.kode_barang, request.qty, item.satuan, request.receiver, request.dept]);

        await connection.commit();

        // Return updated request
        const [updatedRows] = await pool.query(`
            SELECT 
                r.id,
                r.date,
                r.item as name,
                COALESCE(a.kode_barang, '') as code,
                r.qty,
                r.unit,
                r.receiver,
                r.dept,
                'approved' as status
            FROM requests r
            LEFT JOIN atk_items a ON LOWER(r.item) = LOWER(a.nama_barang)
            WHERE r.id = ?
        `, [id]);

        res.json({
            ...updatedRows[0],
            message: `Permintaan disetujui. Stok ${item.nama_barang} berkurang ${request.qty} (sisa: ${newQty})`
        });
    } catch (error) {
        await connection.rollback();
        console.error('Approve request error:', error);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        connection.release();
    }
});

// POST /api/approval/:id/reject - Reject a request (no stock change)
router.post('/:id/reject', authenticate, authorize('admin', 'superadmin'), async (req, res) => {
    try {
        const { id } = req.params;

        // Check request first
        const [reqRows] = await pool.query('SELECT * FROM requests WHERE id = ?', [id]);
        const request = reqRows[0];

        if (!request) {
            return res.status(404).json({ message: 'Request tidak ditemukan' });
        }

        if (request.status !== 'PENDING') {
            return res.status(400).json({ message: 'Request sudah diproses sebelumnya' });
        }

        // Update status to REJECTED (no stock change)
        await pool.execute('UPDATE requests SET status = ? WHERE id = ?', ['REJECTED', id]);

        const [updatedRows] = await pool.query(`
            SELECT 
                r.id,
                r.date,
                r.item as name,
                COALESCE(a.kode_barang, '') as code,
                r.qty,
                r.unit,
                r.receiver,
                r.dept,
                'rejected' as status
            FROM requests r
            LEFT JOIN atk_items a ON LOWER(r.item) = LOWER(a.nama_barang)
            WHERE r.id = ?
        `, [id]);

        res.json(updatedRows[0]);
    } catch (error) {
        console.error('Reject request error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
