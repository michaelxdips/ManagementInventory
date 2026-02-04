import { Router } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// PUT /api/users/profile - Update current user profile
router.put('/profile', authenticate, async (req, res) => {
    try {
        const { name, username } = req.body;

        if (!name || !username) {
            return res.status(400).json({ message: 'Name dan username wajib diisi' });
        }

        // Check if username is taken by another user
        const [existingRows] = await pool.query('SELECT id FROM users WHERE username = ? AND id != ?', [username, req.user.id]);
        if (existingRows.length > 0) {
            return res.status(400).json({ message: 'Username sudah digunakan' });
        }

        await pool.execute('UPDATE users SET name = ?, username = ? WHERE id = ?', [name, username, req.user.id]);

        const [updatedRows] = await pool.query('SELECT id, name, username, role FROM users WHERE id = ?', [req.user.id]);
        const updated = updatedRows[0];

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
router.put('/password', authenticate, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Password lama dan baru wajib diisi' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Password baru minimal 6 karakter' });
        }

        // Verify current password
        const [userRows] = await pool.query('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
        const user = userRows[0];
        const isValid = bcrypt.compareSync(currentPassword, user.password_hash);
        if (!isValid) {
            return res.status(400).json({ message: 'Password lama salah' });
        }

        // Update password
        const newHash = bcrypt.hashSync(newPassword, 10);
        await pool.execute('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, req.user.id]);

        res.json({ message: 'Password berhasil diperbarui' });
    } catch (error) {
        console.error('Update password error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// DELETE /api/users/account - Delete current user account
router.delete('/account', authenticate, async (req, res) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ message: 'Password konfirmasi diperlukan untuk menghapus akun' });
        }

        // Verify password first
        const [userRows] = await pool.query('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
        const user = userRows[0];
        const isValid = bcrypt.compareSync(password, user.password_hash);

        if (!isValid) {
            return res.status(401).json({ message: 'Password salah. Gagal menghapus akun.' });
        }

        // Don't allow deleting superadmin accounts easily
        if (req.user.role === 'superadmin') {
            // Check if this is the last superadmin
            const [countRows] = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = ?', ['superadmin']);
            if (countRows[0].count <= 1) {
                return res.status(400).json({ message: 'Tidak dapat menghapus superadmin terakhir' });
            }
        }

        await pool.execute('DELETE FROM users WHERE id = ?', [req.user.id]);

        res.status(204).send();
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
