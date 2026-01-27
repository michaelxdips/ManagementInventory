const express = require('express');
const router = express.Router();
const { index, store } = require('../controllers/requests.controller');
const { requireAuth, requireRole } = require('../middleware/auth');

router.get('/', requireAuth, requireRole(['user']), index);
router.post('/', requireAuth, requireRole(['user']), store);

module.exports = router;
