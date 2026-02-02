import { Router } from 'express';
import db from '../config/db.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// GET /api/approval - List PENDING requests only (for admin action)
router.get('/', authenticate, authorize('admin', 'superadmin'), (req, res) => {
    try {
        const requests = db.prepare(`
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
    `).all();

        res.json(requests);
    } catch (error) {
        console.error('Get approvals error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// POST /api/approval/:id/approve - Approve request, REDUCE stock, record barang keluar
// FIX #3: Hardened approval logic with double/concurrent prevention
// FIX #4: Manual rollback due to SQLite transaction limitation
router.post('/:id/approve', authenticate, authorize('admin', 'superadmin'), (req, res) => {
    // Variables for manual rollback
    let prevQty = null;
    let stockUpdated = false;
    let itemId = null;

    try {
        const { id } = req.params;

        // Step 1: Fetch request by ID
        const request = db.prepare('SELECT * FROM requests WHERE id = ?').get(id);
        if (!request) {
            return res.status(404).json({ message: 'Request tidak ditemukan' });
        }

        // Step 2: FIX #3 - STRICT status check to prevent double approval
        // If status is not PENDING, this request was already processed
        if (request.status !== 'PENDING') {
            return res.status(400).json({ message: 'Request sudah diproses sebelumnya' });
        }

        // Step 3: Find the item in inventory
        const item = db.prepare('SELECT * FROM atk_items WHERE LOWER(nama_barang) = LOWER(?)').get(request.item);
        if (!item) {
            return res.status(400).json({ message: `Barang "${request.item}" tidak ditemukan di inventory` });
        }

        // Step 4: FIX #5 - Re-validate stock availability (backend validation hardening)
        // Never trust frontend - always check current stock
        if (item.qty < request.qty) {
            return res.status(400).json({
                message: `Stok tidak cukup. Tersedia: ${item.qty}, Diminta: ${request.qty}`
            });
        }

        // FIX #1: Ensure resulting stock is not negative
        const newQty = item.qty - request.qty;
        if (newQty < 0) {
            return res.status(400).json({ message: 'Quantity cannot be negative' });
        }

        // FIX #4: Save previous values for manual rollback
        // Manual rollback due to SQLite transaction limitation
        prevQty = item.qty;
        itemId = item.id;

        // Step 5: Update request status to APPROVED FIRST (prevents concurrent approval)
        db.prepare('UPDATE requests SET status = ? WHERE id = ?').run('APPROVED', id);

        // Step 6: REDUCE stock
        db.prepare('UPDATE atk_items SET qty = ? WHERE id = ?').run(newQty, itemId);
        stockUpdated = true;

        // Step 7: Record barang keluar
        const today = new Date().toISOString().split('T')[0];
        try {
            db.prepare(`
                INSERT INTO barang_keluar (date, atk_item_id, nama_barang, kode_barang, qty, satuan, penerima, dept)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `).run(today, item.id, item.nama_barang, item.kode_barang, request.qty, item.satuan, request.receiver, request.dept);
        } catch (insertError) {
            // FIX #4: Manual rollback due to SQLite transaction limitation
            // If insert fails, restore stock to previous value
            console.error('Insert barang_keluar failed, rolling back:', insertError);
            if (stockUpdated && itemId !== null && prevQty !== null) {
                db.prepare('UPDATE atk_items SET qty = ? WHERE id = ?').run(prevQty, itemId);
            }
            db.prepare('UPDATE requests SET status = ? WHERE id = ?').run('PENDING', id);
            return res.status(500).json({ message: 'Gagal mencatat barang keluar, perubahan dibatalkan' });
        }

        // barang_kosong is derived from atk_items WHERE qty=0
        // No separate table insert needed (single source of truth)

        // Return updated request
        const updated = db.prepare(`
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
        `).get(id);

        res.json({
            ...updated,
            message: `Permintaan disetujui. Stok ${item.nama_barang} berkurang ${request.qty} (sisa: ${newQty})`
        });
    } catch (error) {
        console.error('Approve request error:', error);

        // FIX #4: Manual rollback due to SQLite transaction limitation
        // Attempt to restore state if error occurred after stock update
        if (stockUpdated && itemId !== null && prevQty !== null) {
            try {
                db.prepare('UPDATE atk_items SET qty = ? WHERE id = ?').run(prevQty, itemId);
                db.prepare('UPDATE requests SET status = ? WHERE id = ?').run('PENDING', req.params.id);
            } catch (rollbackError) {
                console.error('Rollback failed:', rollbackError);
            }
        }

        res.status(500).json({ message: 'Internal server error' });
    }
});

// POST /api/approval/:id/reject - Reject a request (no stock change)
router.post('/:id/reject', authenticate, authorize('admin', 'superadmin'), (req, res) => {
    try {
        const { id } = req.params;

        const request = db.prepare('SELECT * FROM requests WHERE id = ?').get(id);
        if (!request) {
            return res.status(404).json({ message: 'Request tidak ditemukan' });
        }

        // FIX #3: Strict status check - prevent double rejection
        if (request.status !== 'PENDING') {
            return res.status(400).json({ message: 'Request sudah diproses sebelumnya' });
        }

        // Update status to REJECTED (no stock change)
        db.prepare('UPDATE requests SET status = ? WHERE id = ?').run('REJECTED', id);

        const updated = db.prepare(`
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
        `).get(id);

        res.json(updated);
    } catch (error) {
        console.error('Reject request error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
