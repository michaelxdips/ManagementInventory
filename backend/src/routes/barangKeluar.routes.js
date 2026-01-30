const express = require("express");
const router = express.Router();

const {
  createBarangKeluar,
  takeItem,
} = require("../controllers/barangKeluar.controller");
const { requireAuth, requireRole } = require('../middleware/auth');

router.post("/", requireAuth, requireRole(['admin', 'superadmin']), createBarangKeluar);
router.post("/take", requireAuth, takeItem);

module.exports = router;
