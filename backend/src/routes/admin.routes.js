const express = require('express');
const router = express.Router();
const { createProduct, updateProduct, deleteProduct, getAllProductsAdmin } = require('../controllers/product.controller');
const { getLogs } = require('../controllers/log.controller');
const { verifyToken, requireAdmin } = require('../middlewares/auth');

router.get('/products', verifyToken, requireAdmin, getAllProductsAdmin);
router.post('/products', verifyToken, requireAdmin, createProduct);
router.put('/products/:id', verifyToken, requireAdmin, updateProduct);
router.delete('/products/:id', verifyToken, requireAdmin, deleteProduct);
router.get('/logs', verifyToken, requireAdmin, getLogs);

module.exports = router;