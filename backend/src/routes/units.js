import { Router } from 'express';
import bcrypt from 'bcryptjs';
import db from '../config/db.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// GET /api/units - List all units (users with role 'user') - SUPERADMIN ONLY
router.get('/', authenticate, authorize('superadmin'), (req, res) => {
    try {
        const units = db.prepare(`
      SELECT id, name, username 
      FROM users 
      WHERE role = 'user'
      ORDER BY name ASC
    `).all();

        res.json(units);
    } catch (error) {
        console.error('Get units error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// POST /api/units - Create new unit (user account) - SUPERADMIN ONLY
router.post('/', authenticate, authorize('superadmin'), (req, res) => {
    try {
        const { unitName, username, password } = req.body;

        if (!unitName || !username || !password) {
            return res.status(400).json({ message: 'Unit name, username, dan password wajib diisi' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password minimal 6 karakter' });
        }

        // Check if username already exists
        const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
        if (existing) {
            return res.status(400).json({ message: 'Username sudah digunakan' });
        }

        // Hash password
        const passwordHash = bcrypt.hashSync(password, 10);

        // Create user with role 'user'
        const result = db.prepare(`
      INSERT INTO users (name, username, password_hash, role)
      VALUES (?, ?, ?, 'user')
    `).run(unitName, username, passwordHash);

        const newUnit = db.prepare('SELECT id, name, username FROM users WHERE id = ?').get(result.lastInsertRowid);

        res.status(201).json(newUnit);
    } catch (error) {
        console.error('Create unit error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// DELETE /api/units/:id - Delete a unit - SUPERADMIN ONLY
router.delete('/:id', authenticate, authorize('superadmin'), (req, res) => {
    try {
        const { id } = req.params;

        // Check if unit exists
        const unit = db.prepare('SELECT * FROM users WHERE id = ? AND role = ?').get(id, 'user');
        if (!unit) {
            return res.status(404).json({ message: 'Unit tidak ditemukan' });
        }

        // OPTIMIZATION: Orphan Data Protection
        // Check if user has associated requests
        const hasRequests = db.prepare('SELECT 1 FROM requests WHERE user_id = ? LIMIT 1').get(id);
        if (hasRequests) {
            return res.status(400).json({
                message: 'Tidak dapat menghapus unit ini karena memiliki riwayat request. Nonaktifkan akun jika perlu.'
            });
        }

        db.prepare('DELETE FROM users WHERE id = ?').run(id);

        res.status(204).send();
    } catch (error) {
        console.error('Delete unit error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
