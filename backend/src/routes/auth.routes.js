const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const {
  register,
  verifyEmail,
  resendVerification,
  login,
  verify2FA,
  resend2FA,
  forgotPassword,
  resetPassword,
  getMe,
  generateTwoFactorSetup,
  confirmTwoFactorSetup,
  disableTwoFactor,
  logout,
} = require('../controllers/auth.controller');
const { verifyToken } = require('../middlewares/auth');

// Tight limiters for OTP/code verification to prevent brute-forcing
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many verification attempts. Please try again later.' },
});

const tokenLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Please try again later.' },
});

router.post('/register', register);
router.get('/verify-email', verifyEmail);
router.post('/resend-verification', tokenLimiter, resendVerification);
router.post('/login', login);
router.post('/verify-2fa', otpLimiter, verify2FA);
router.post('/resend-2fa', otpLimiter, resend2FA);
router.post('/forgot-password', tokenLimiter, forgotPassword);
router.post('/reset-password', tokenLimiter, resetPassword);

router.get('/me', verifyToken, getMe);
router.post('/logout', logout);

// 2FA setup (authenticated)
router.post('/two-factor/send', verifyToken, generateTwoFactorSetup);
router.post('/two-factor/enable', verifyToken, otpLimiter, confirmTwoFactorSetup);
router.post('/two-factor/disable', verifyToken, disableTwoFactor);

module.exports = router;
