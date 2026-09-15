const express = require('express');
const router = express.Router();
const { createPaymentIntent, confirmPayment, handleWebhook } = require('../controllers/payment.controller');
const { verifyToken } = require('../middlewares/auth');

router.post('/intent', verifyToken, createPaymentIntent);
router.post('/confirm', verifyToken, confirmPayment);
router.post('/webhook', handleWebhook);

module.exports = router;