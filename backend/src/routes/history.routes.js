const express = require('express');
const router = express.Router();
const { listMasuk, listKeluar } = require('../controllers/history.controller');
const { requireAuth, requireRole } = require('../middleware/auth');

router.get('/masuk', requireAuth, requireRole(['admin', 'superadmin']), listMasuk);
router.get('/keluar', requireAuth, listKeluar);

module.exports = router;
