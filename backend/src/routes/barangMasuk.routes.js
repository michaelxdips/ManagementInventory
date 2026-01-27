const express = require("express");
const router = express.Router();

const {
  createBarangMasuk,
} = require("../controllers/barangMasuk.controller");
const { requireAuth, requireRole } = require('../middleware/auth');

router.post("/", requireAuth, requireRole(['admin', 'superadmin']), createBarangMasuk);

module.exports = router;
