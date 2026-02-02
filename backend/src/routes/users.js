import { Router } from 'express';
import bcrypt from 'bcryptjs';
import db from '../config/db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// PUT /api/users/profile - Update current user profile
router.put('/profile', authenticate, (req, res) => {
    try {
        const { name, username } = req.body;

        if (!name || !username) {
            return res.status(400).json({ message: 'Name dan username wajib diisi' });
        }

        // Check if username is taken by another user
        const existing = db.prepare('SELECT id FROM users WHERE username = ? AND id != ?').get(username, req.user.id);
        if (existing) {
            return res.status(400).json({ message: 'Username sudah digunakan' });
        }

        db.prepare('UPDATE users SET name = ?, username = ? WHERE id = ?').run(name, username, req.user.id);

        const updated = db.prepare('SELECT id, name, username, role FROM users WHERE id = ?').get(req.user.id);

        res.json({
            id: String(updated.id),
            name: updated.name,
            username: updated.username,
            role: updated.role,
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// PUT /api/users/password - Update current user password
router.put('/password', authenticate, (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Password lama dan baru wajib diisi' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Password baru minimal 6 karakter' });
        }

        // Verify current password
        const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user.id);
        const isValid = bcrypt.compareSync(currentPassword, user.password_hash);
        if (!isValid) {
            return res.status(400).json({ message: 'Password lama salah' });
        }

        // Update password
        const newHash = bcrypt.hashSync(newPassword, 10);
        db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newHash, req.user.id);

        res.json({ message: 'Password berhasil diperbarui' });
    } catch (error) {
        console.error('Update password error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// DELETE /api/users/account - Delete current user account
router.delete('/account', authenticate, (req, res) => {
    try {
        // Don't allow deleting superadmin accounts easily
        if (req.user.role === 'superadmin') {
            // Check if this is the last superadmin
            const superadminCount = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = ?').get('superadmin');
            if (superadminCount.count <= 1) {
                return res.status(400).json({ message: 'Tidak dapat menghapus superadmin terakhir' });
            }
        }

        db.prepare('DELETE FROM users WHERE id = ?').run(req.user.id);

        res.status(204).send();
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
