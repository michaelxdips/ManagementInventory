const express = require('express');
const router = express.Router();
const { index, approve, reject } = require('../controllers/approval.controller');
const { requireAuth, requireRole } = require('../middleware/auth');

router.get('/', requireAuth, requireRole(['admin', 'superadmin']), index);
router.post('/:id/approve', requireAuth, requireRole(['admin', 'superadmin']), approve);
router.post('/:id/reject', requireAuth, requireRole(['admin', 'superadmin']), reject);

module.exports = router;
