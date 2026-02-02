import jwt from 'jsonwebtoken';
import db from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key';

export const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token tidak ditemukan' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        // Get user from database
        const user = db.prepare('SELECT id, name, username, role FROM users WHERE id = ?').get(decoded.userId);

        if (!user) {
            return res.status(401).json({ message: 'User tidak ditemukan' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token tidak valid' });
    }
};

// Middleware to check specific roles
export const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Akses ditolak. Role tidak diizinkan.' });
        }

        next();
    };
};

// Optional auth - doesn't fail if no token, just sets req.user to null
export const optionalAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        req.user = null;
        return next();
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = db.prepare('SELECT id, name, username, role FROM users WHERE id = ?').get(decoded.userId);
        req.user = user || null;
    } catch {
        req.user = null;
    }

    next();
};
