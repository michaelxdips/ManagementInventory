import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { username, password, role } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Username dan password wajib diisi' });
        }

        // Find user by username
        let query = 'SELECT * FROM users WHERE username = ?';
        const params = [username];

        // If role specified, also filter by role
        if (role) {
            query += ' AND role = ?';
            params.push(role);
        }

        const [rows] = await pool.execute(query, params);
        const user = rows[0];

        if (!user) {
            return res.status(401).json({ message: 'Username atau password salah' });
        }

        // Verify password
        const isValidPassword = bcrypt.compareSync(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Username atau password salah' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        // Return user data (without password) and token
        res.json({
            user: {
                id: String(user.id),
                name: user.name,
                username: user.username,
                role: user.role,
            },
            token,
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// POST /api/auth/logout
router.post('/logout', authenticate, (req, res) => {
    // In a simple JWT setup, logout is handled client-side by removing the token
    // For more security, you could implement token blacklisting here
    res.status(204).send();
});

// GET /api/auth/me
router.get('/me', authenticate, (req, res) => {
    res.json({
        id: String(req.user.id),
        name: req.user.name,
        username: req.user.username,
        role: req.user.role,
    });
});

export default router;
