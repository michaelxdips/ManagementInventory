import { Router } from 'express';
import pool from '../config/db.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// Endpoint removed during audit - Security Risk & Dead Code
// Request/Approval flow uses /api/requests and /api/approval instead.
// router.post('/take', ...);

export default router;
