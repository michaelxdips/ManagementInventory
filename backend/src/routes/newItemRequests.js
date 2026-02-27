import { Router } from 'express';
import pool from '../config/db.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// ────────────────────────────────────────────────────────────────────
// DOMAIN: Inventory Creation (Request Barang Baru)
// This file is COMPLETELY SEPARATE from the Ambil Barang domain.
// It only INSERTs new items into atk_items — never touches stock.
// ────────────────────────────────────────────────────────────────────

// GET /api/new-item-requests — List requests
// User: sees own requests only. Admin/SuperAdmin: sees all.
router.get('/', authenticate, async (req, res) => {
    try {
        let query = `
            SELECT 
                r.id,
                r.item_name,
                r.description,
                r.satuan,
                r.category,
                r.reason,
                r.status,
                r.approved_by,
                r.approved_quantity,
                r.reject_reason,
                r.created_at,
                r.updated_at,
                u.name as requested_by_name
            FROM item_requests_new r
            JOIN users u ON r.requested_by = u.id
        `;
        const params = [];

        if (req.user.role === 'user') {
            query += ' WHERE r.requested_by = ?';
            params.push(req.user.id);
        }

        query += ' ORDER BY r.created_at DESC';

        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error('Get new item requests error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// POST /api/new-item-requests — User creates request for NEW item
router.post('/', authenticate, async (req, res) => {
    try {
        const { item_name, description, satuan, category, reason } = req.body;

        if (!item_name || !item_name.trim()) {
            return res.status(400).json({ message: 'Nama barang wajib diisi' });
        }

        const trimmedName = item_name.trim();

        // Check 1: Item must NOT exist in atk_items (case-insensitive)
        const [existingItem] = await pool.query(
            'SELECT id, nama_barang FROM atk_items WHERE LOWER(nama_barang) = LOWER(?)',
            [trimmedName]
        );

        if (existingItem.length > 0) {
            return res.status(409).json({
                message: `Barang "${existingItem[0].nama_barang}" sudah ada di inventory. Gunakan fitur "Ambil Barang" untuk request barang yang sudah ada.`
            });
        }

        // Check 2: No duplicate PENDING request for the same item name
        const [pendingReq] = await pool.query(
            "SELECT id FROM item_requests_new WHERE LOWER(item_name) = LOWER(?) AND status = 'PENDING'",
            [trimmedName]
        );

        if (pendingReq.length > 0) {
            return res.status(409).json({
                message: `Sudah ada request pending untuk barang "${trimmedName}". Tunggu hingga request tersebut diproses.`
            });
        }

        // Insert new request
        const [result] = await pool.execute(`
            INSERT INTO item_requests_new (requested_by, item_name, description, satuan, category, reason)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [
            req.user.id,
            trimmedName,
            description?.trim() || null,
            satuan?.trim() || null,
            category?.trim() || null,
            reason?.trim() || null
        ]);

        const [newRow] = await pool.query(`
            SELECT r.*, u.name as requested_by_name
            FROM item_requests_new r
            JOIN users u ON r.requested_by = u.id
            WHERE r.id = ?
        `, [result.insertId]);

        res.status(201).json(newRow[0]);
    } catch (error) {
        console.error('Create new item request error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// POST /api/new-item-requests/:id/approve — Admin approves, creates new item
router.post('/:id/approve', authenticate, authorize('admin', 'superadmin'), async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { id } = req.params;
        const { approved_quantity, satuan, category, lokasi_simpan, kode_barang } = req.body;

        // Validate approved_quantity
        const qty = parseInt(approved_quantity, 10);
        if (!qty || qty <= 0 || isNaN(qty)) {
            connection.release();
            return res.status(400).json({ message: 'Jumlah yang disetujui harus lebih dari 0' });
        }

        await connection.beginTransaction();

        // Step 1: Lock and fetch request
        const [reqRows] = await connection.query(
            'SELECT * FROM item_requests_new WHERE id = ? FOR UPDATE',
            [id]
        );
        const request = reqRows[0];

        if (!request) {
            await connection.rollback();
            connection.release();
            return res.status(404).json({ message: 'Request tidak ditemukan' });
        }

        // Step 2: STRICT status check — only PENDING can be approved
        if (request.status !== 'PENDING') {
            await connection.rollback();
            connection.release();
            return res.status(400).json({ message: 'Request sudah diproses sebelumnya' });
        }

        // Step 3: Double-check item doesn't already exist (race condition guard)
        const [existingItem] = await connection.query(
            'SELECT id, nama_barang FROM atk_items WHERE LOWER(nama_barang) = LOWER(?)',
            [request.item_name]
        );

        if (existingItem.length > 0) {
            await connection.rollback();
            connection.release();
            return res.status(409).json({
                message: `Barang "${existingItem[0].nama_barang}" sudah ada di inventory. Tidak bisa approve.`
            });
        }

        // Step 4: INSERT new item into atk_items
        const finalSatuan = satuan?.trim() || request.satuan || 'pcs';
        const [itemResult] = await connection.execute(`
            INSERT INTO atk_items (nama_barang, kode_barang, qty, satuan, lokasi_simpan)
            VALUES (?, ?, ?, ?, ?)
        `, [
            request.item_name,
            kode_barang?.trim() || null,
            qty,
            finalSatuan,
            lokasi_simpan?.trim() || null
        ]);

        // Step 5: Update request status to APPROVED
        await connection.execute(`
            UPDATE item_requests_new 
            SET status = 'APPROVED', 
                approved_by = ?, 
                approved_quantity = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [req.user.id, qty, id]);

        await connection.commit();

        res.json({
            message: `Barang "${request.item_name}" berhasil ditambahkan ke inventory dengan stok awal ${qty} ${finalSatuan}.`,
            item_id: itemResult.insertId,
            item_name: request.item_name,
            approved_quantity: qty,
            satuan: finalSatuan
        });
    } catch (error) {
        await connection.rollback();
        console.error('Approve new item request error:', error);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        connection.release();
    }
});

// POST /api/new-item-requests/:id/reject — Admin rejects request
router.post('/:id/reject', authenticate, authorize('admin', 'superadmin'), async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { id } = req.params;
        const { reason } = req.body;

        if (!reason || !reason.trim()) {
            connection.release();
            return res.status(400).json({ message: 'Alasan penolakan wajib diisi' });
        }

        await connection.beginTransaction();

        // Lock and fetch
        const [reqRows] = await connection.query(
            'SELECT * FROM item_requests_new WHERE id = ? FOR UPDATE',
            [id]
        );
        const request = reqRows[0];

        if (!request) {
            await connection.rollback();
            connection.release();
            return res.status(404).json({ message: 'Request tidak ditemukan' });
        }

        if (request.status !== 'PENDING') {
            await connection.rollback();
            connection.release();
            return res.status(400).json({ message: 'Request sudah diproses sebelumnya' });
        }

        // Update status to REJECTED
        await connection.execute(`
            UPDATE item_requests_new 
            SET status = 'REJECTED', 
                reject_reason = ?,
                approved_by = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [reason.trim(), req.user.id, id]);

        await connection.commit();

        res.json({
            message: 'Request ditolak',
            id: parseInt(id),
            status: 'REJECTED',
            reject_reason: reason.trim()
        });
    } catch (error) {
        await connection.rollback();
        console.error('Reject new item request error:', error);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        connection.release();
    }
});

export default router;
