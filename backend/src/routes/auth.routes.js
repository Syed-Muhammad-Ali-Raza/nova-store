const express = require('express');
const router = express.Router();
const { register, login, logout } = require('../controllers/auth.controller');
const { verifyToken } = require('../middlewares/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', verifyToken, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
