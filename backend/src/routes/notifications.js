import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import notificationService from '../utils/notificationService.js';

const router = Router();

// Middleware: EventSource can't send headers, so accept token from query param
const sseAuth = (req, res, next) => {
    if (req.query.token && !req.headers.authorization) {
        req.headers.authorization = `Bearer ${req.query.token}`;
    }
    next();
};

// GET /api/notifications/stream - Server-Sent Events Endpoint
router.get('/stream', sseAuth, authenticate, (req, res) => {
    // Standard SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    // Important for avoiding buffering issues in proxies/nginx
    res.setHeader('X-Accel-Buffering', 'no');
    
    // Register this client with their role for scoped broadcasts
    notificationService.addClient(req.user.id, res, req.user.role);

    // Send initial connection success event
    res.write(`event: connected\ndata: ${JSON.stringify({ message: 'Real-time connection established', userId: req.user.id })}\n\n`);
});

export default router;

