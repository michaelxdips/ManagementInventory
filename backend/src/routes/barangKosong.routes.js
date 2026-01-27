const express = require('express');
const controller = require('../controllers/barangKosong.controller');

const router = express.Router();

router.get('/', controller.index);
router.post('/', controller.store);

module.exports = router;