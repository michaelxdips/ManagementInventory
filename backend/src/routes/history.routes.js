const express = require('express');
const router = express.Router();
const { listMasuk, listKeluar } = require('../controllers/history.controller');

router.get('/masuk', listMasuk);
router.get('/keluar', listKeluar);

module.exports = router;
