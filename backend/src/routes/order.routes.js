const express = require('express');
const router = express.Router();
const { createOrder, getOrders } = require('../controllers/order.controller');
const { verifyToken } = require('../middlewares/auth');

router.post('/', verifyToken, createOrder);
router.get('/', verifyToken, getOrders);

module.exports = router;