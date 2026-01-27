const express = require("express");
const router = express.Router();

const {
  index,
  show,
  store,
  update,
} = require("../controllers/atkItem.controller");
const { requireAuth, requireRole } = require('../middleware/auth');

router.get("/", requireAuth, index);
router.get("/:id", requireAuth, show);
router.post("/", requireAuth, requireRole(['admin', 'superadmin']), store);
router.put("/:id", requireAuth, requireRole(['admin', 'superadmin']), update);

module.exports = router;
