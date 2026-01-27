const express = require("express");
const router = express.Router();

const {
  createBarangKeluar,
} = require("../controllers/barangKeluar.controller");
const { requireAuth, requireRole } = require('../middleware/auth');

router.post("/", requireAuth, requireRole(['admin', 'superadmin']), createBarangKeluar);

module.exports = router;
