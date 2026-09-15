const express = require('express');
const router = express.Router();
const { createLog, getLogs } = require('../controllers/log.controller');
const { verifyToken, requireAdmin } = require('../middlewares/auth');

router.post('/', verifyToken, createLog);
router.get('/admin', verifyToken, requireAdmin, getLogs);

module.exports = router;