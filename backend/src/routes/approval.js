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
      LEFT JOIN atk_items a ON r.atk_item_id = a.id
      WHERE r.status IN ('PENDING', 'APPROVAL_REVIEW')
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
        const [itemRows] = await connection.query('SELECT * FROM atk_items WHERE id = ? FOR UPDATE', [request.atk_item_id]);
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
            LEFT JOIN atk_items a ON r.atk_item_id = a.id
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

// GET /api/approval/:id/detail - Get request + item details for finalization page (with quota info)
router.get('/:id/detail', authenticate, authorize('admin', 'superadmin'), async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await pool.query(`
            SELECT 
                r.id,
                r.date,
                r.item as name,
                r.qty as requestQty,
                r.unit,
                r.receiver,
                r.dept,
                r.status,
                r.user_id,
                COALESCE(a.id, 0) as item_id,
                COALESCE(a.kode_barang, '') as kode_barang,
                COALESCE(a.lokasi_simpan, '') as lokasi_barang,
                COALESCE(a.qty, 0) as stok_tersedia,
                COALESCE(a.satuan, r.unit) as satuan
            FROM requests r
            LEFT JOIN atk_items a ON r.atk_item_id = a.id
            WHERE r.id = ?
        `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Request tidak ditemukan' });
        }

        const request = rows[0];

        // REMOVED STRICT CHECK to allow viewing details for PENDING/APPROVED requests
        // logic moved to frontend
        // if (request.status !== 'APPROVAL_REVIEW') {
        //     return res.status(400).json({ message: `Request tidak dalam status review. Status saat ini: ${request.status}` });
        // }

        res.json({
            ...request
        });
    } catch (error) {
        console.error('Get approval detail error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// POST /api/approval/:id/review - Move request from PENDING to APPROVAL_REVIEW (no stock change)
router.post('/:id/review', authenticate, authorize('admin', 'superadmin'), async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { id } = req.params;

        await connection.beginTransaction();

        // Lock the row to prevent race conditions
        const [reqRows] = await connection.query('SELECT * FROM requests WHERE id = ? FOR UPDATE', [id]);
        const request = reqRows[0];

        if (!request) {
            await connection.rollback();
            return res.status(404).json({ message: 'Request tidak ditemukan' });
        }

        if (request.status !== 'PENDING') {
            await connection.rollback();
            return res.status(400).json({ message: 'Request sudah diproses sebelumnya' });
        }

        // Update status to APPROVAL_REVIEW — NO stock change
        await connection.execute('UPDATE requests SET status = ? WHERE id = ?', ['APPROVAL_REVIEW', id]);

        await connection.commit();

        res.json({ id: parseInt(id), status: 'APPROVAL_REVIEW', message: 'Request siap untuk direview dan difinalisasi' });
    } catch (error) {
        await connection.rollback();
        console.error('Review request error:', error);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        connection.release();
    }
});

// POST /api/approval/:id/finalize - Finalize approval: validate qty, deduct stock, insert barang_keluar
router.post('/:id/finalize', authenticate, authorize('admin', 'superadmin'), async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { id } = req.params;
        const { finalQty } = req.body;

        // Validate finalQty exists and is a positive number
        const qty = parseInt(finalQty, 10);
        if (!qty || qty <= 0 || isNaN(qty)) {
            return res.status(400).json({ message: 'Jumlah harus lebih dari 0' });
        }

        await connection.beginTransaction();

        // Step 1: Lock and fetch request
        const [reqRows] = await connection.query('SELECT * FROM requests WHERE id = ? FOR UPDATE', [id]);
        const request = reqRows[0];

        if (!request) {
            await connection.rollback();
            return res.status(404).json({ message: 'Request tidak ditemukan' });
        }

        // Step 2: STRICT status check — only APPROVAL_REVIEW can be finalized
        if (request.status !== 'APPROVAL_REVIEW') {
            await connection.rollback();
            return res.status(400).json({ message: 'Request tidak dalam status review. Tidak bisa difinalisasi.' });
        }

        // Step 3: Validate finalQty <= request.qty
        if (qty > request.qty) {
            await connection.rollback();
            return res.status(400).json({ message: `Jumlah finalisasi (${qty}) melebihi jumlah permintaan (${request.qty})` });
        }

        // Step 4: Find and lock inventory item
        const [itemRows] = await connection.query('SELECT * FROM atk_items WHERE id = ? FOR UPDATE', [request.atk_item_id]);
        const item = itemRows[0];

        if (!item) {
            await connection.rollback();
            return res.status(400).json({ message: `Barang "${request.item}" tidak ditemukan di inventory` });
        }

        // Step 5: Validate finalQty <= current stock (R1)
        if (qty > item.qty) {
            await connection.rollback();
            return res.status(400).json({
                message: `Stok tidak cukup. Tersedia: ${item.qty}, Diminta: ${qty}`
            });
        }

        const newQty = item.qty - qty;
        if (newQty < 0) {
            await connection.rollback();
            return res.status(400).json({ message: 'Stok tidak boleh negatif' });
        }

        // Step 6: Update request status to APPROVED
        await connection.execute('UPDATE requests SET status = ? WHERE id = ?', ['APPROVED', id]);

        // Step 7: REDUCE stock
        await connection.execute('UPDATE atk_items SET qty = ? WHERE id = ?', [newQty, item.id]);



        // Step 8: Record barang keluar with FINAL qty (not original request qty)
        // Use request.date (Tanggal Ambil) instead of current date (Tanggal Approval)
        await connection.execute(`
            INSERT INTO barang_keluar (date, atk_item_id, nama_barang, kode_barang, qty, satuan, penerima, dept)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [request.date, item.id, item.nama_barang, item.kode_barang, qty, item.satuan, request.receiver, request.dept]);

        await connection.commit();

        res.json({
            message: `Barang keluar dicatat. Stok ${item.nama_barang} berkurang ${qty} (sisa: ${newQty})`,
            finalQty: qty,
            newStock: newQty
        });
    } catch (error) {
        await connection.rollback();
        console.error('Finalize request error:', error);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        connection.release();
    }
});

// POST /api/approval/:id/reject - Reject a request (no stock change)
router.post('/:id/reject', authenticate, authorize('admin', 'superadmin'), async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { id } = req.params;

        await connection.beginTransaction();

        // Lock and fetch request
        const [reqRows] = await connection.query('SELECT * FROM requests WHERE id = ? FOR UPDATE', [id]);
        const request = reqRows[0];

        if (!request) {
            await connection.rollback();
            return res.status(404).json({ message: 'Request tidak ditemukan' });
        }

        if (request.status !== 'PENDING' && request.status !== 'APPROVAL_REVIEW') {
            await connection.rollback();
            return res.status(400).json({ message: 'Request sudah diproses sebelumnya' });
        }

        // Update status to REJECTED (no stock change)
        await connection.execute('UPDATE requests SET status = ? WHERE id = ?', ['REJECTED', id]);

        await connection.commit();

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
            LEFT JOIN atk_items a ON r.atk_item_id = a.id
            WHERE r.id = ?
        `, [id]);

        res.json(updatedRows[0]);
    } catch (error) {
        await connection.rollback();
        console.error('Reject request error:', error);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        connection.release();
    }
});

export default router;
