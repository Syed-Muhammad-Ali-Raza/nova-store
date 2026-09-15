const prisma = require('../utils/prisma');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { generateToken, generateOtp, hashToken, isExpired, hoursFromNow, minutesFromNow } = require('../utils/tokens');
const { sendVerificationEmail, sendTwoFactorEmail, sendResetPasswordEmail } = require('../utils/email');

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const GENERIC_VERIFICATION_MESSAGE =
  'If an unverified account exists with that email, a new verification link has been sent.';
const GENERIC_RESET_MESSAGE = 'If an account exists with that email, a password reset link has been sent.';

const normalizeEmail = (email) => email.trim().toLowerCase();
const isValidEmail = (email) => typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
const isValidPassword = (password) =>
  typeof password === 'string' && password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);
const isValidOtp = (otp) => typeof otp === 'string' && /^\d{6}$/.test(otp);

const publicUser = (user) => ({
  id: user.id,
  email: user.email,
  role: user.role,
  emailVerified: user.emailVerified,
  twoFactorEnabled: user.twoFactorEnabled,
});

const setAuthCookie = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1d' });
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });
};

const clearAuthCookie = (res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
};

const createVerificationLink = async (userId) => {
  const token = generateToken();
  await prisma.user.update({
    where: { id: userId },
    data: {
      emailVerificationToken: hashToken(token),
      emailVerificationExpires: hoursFromNow(24),
    },
  });
  return `${CLIENT_URL}/verify-email?token=${token}`;
};

const register = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'A valid email is required' });
    }
    if (!isValidPassword(password)) {
      return res
        .status(400)
        .json({ message: 'Password must be at least 8 characters and include a letter and number' });
    }

    const normalizedEmail = normalizeEmail(email);
    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email: normalizedEmail, passwordHash, emailVerified: false },
    });

    const link = await createVerificationLink(user.id);
    let emailSent = true;
    try {
      await sendVerificationEmail(user.email, link);
    } catch (error) {
      emailSent = false;
      console.error('[email]', error.message);
    }

    res.status(201).json({
      message: emailSent
        ? 'User registered successfully. Please verify your email.'
        : 'Account created, but the verification email could not be sent. Please use resend.',
      userId: user.id,
      emailSent,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (typeof token !== 'string' || !token) {
      return res.status(400).json({ message: 'Missing verification token' });
    }

    const user = await prisma.user.findUnique({
      where: { emailVerificationToken: hashToken(token) },
    });
    if (!user) {
      return res.status(400).json({ message: 'Invalid verification link. Please request a new one.' });
    }
    if (user.emailVerified) {
      return res.json({ message: 'Email already verified. You can log in now.' });
    }
    if (isExpired(user.emailVerificationExpires)) {
      return res.status(400).json({ message: 'Verification link has expired. Please request a new one.' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, emailVerificationToken: null, emailVerificationExpires: null },
    });

    res.json({ message: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await prisma.user.findUnique({ where: { email: normalizeEmail(email) } });
    if (user && !user.emailVerified) {
      const link = await createVerificationLink(user.id);
      await sendVerificationEmail(user.email, link).catch((error) => console.error('[email]', error.message));
    }

    res.json({ message: GENERIC_VERIFICATION_MESSAGE });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email: normalizeEmail(email) } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.emailVerified) {
      return res.status(403).json({ message: 'Please verify your email before logging in.' });
    }

    if (user.twoFactorEnabled) {
      const challenge = generateToken();
      const otp = generateOtp();
      await prisma.user.update({
        where: { id: user.id },
        data: {
          twoFactorChallenge: hashToken(challenge),
          twoFactorOtp: hashToken(otp),
          twoFactorChallengeExpires: minutesFromNow(10),
        },
      });
      try {
        await sendTwoFactorEmail(user.email, otp);
      } catch (error) {
        await prisma.user.update({
          where: { id: user.id },
          data: { twoFactorChallenge: null, twoFactorOtp: null, twoFactorChallengeExpires: null },
        });
        console.error('[email]', error.message);
        return res.status(503).json({ message: 'Unable to send your security code. Please try again.' });
      }
      return res.json({ pendingTwoFactor: true, challenge });
    }

    setAuthCookie(res, user.id);
    res.json({ message: 'Logged in successfully', user: publicUser(user) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const verify2FA = async (req, res) => {
  try {
    const { challenge, otp } = req.body;
    if (typeof challenge !== 'string' || !challenge || !isValidOtp(otp)) {
      return res.status(400).json({ message: 'Challenge and a valid 6-digit code are required' });
    }

    const user = await prisma.user.findUnique({ where: { twoFactorChallenge: hashToken(challenge) } });
    if (!user || !user.twoFactorEnabled || isExpired(user.twoFactorChallengeExpires)) {
      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: { twoFactorChallenge: null, twoFactorOtp: null, twoFactorChallengeExpires: null },
        });
      }
      return res.status(401).json({ message: 'Invalid or expired verification code' });
    }
    if (user.twoFactorOtp !== hashToken(otp)) {
      return res.status(401).json({ message: 'Incorrect verification code' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorChallenge: null, twoFactorOtp: null, twoFactorChallengeExpires: null },
    });

    setAuthCookie(res, user.id);
    res.json({ message: 'Verified successfully', user: publicUser(user) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const resend2FA = async (req, res) => {
  try {
    const { challenge } = req.body;
    if (typeof challenge !== 'string' || !challenge) {
      return res.status(400).json({ message: 'Challenge is required' });
    }

    const user = await prisma.user.findUnique({ where: { twoFactorChallenge: hashToken(challenge) } });
    if (!user || !user.twoFactorEnabled) {
      return res.status(401).json({ message: 'Invalid challenge' });
    }

    const otp = generateOtp();
    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorOtp: hashToken(otp), twoFactorChallengeExpires: minutesFromNow(10) },
    });
    try {
      await sendTwoFactorEmail(user.email, otp);
    } catch (error) {
      console.error('[email]', error.message);
      return res.status(503).json({ message: 'Unable to send a new security code. Please try again.' });
    }

    res.json({ message: 'A new code has been sent' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await prisma.user.findUnique({ where: { email: normalizeEmail(email) } });
    if (user) {
      const resetToken = generateToken();
      await prisma.user.update({
        where: { id: user.id },
        data: { resetPasswordToken: hashToken(resetToken), resetPasswordExpires: hoursFromNow(1) },
      });
      const link = `${CLIENT_URL}/reset-password?token=${resetToken}`;
      await sendResetPasswordEmail(user.email, link).catch((err) => console.error('[email]', err.message));
    }

    res.json({ message: GENERIC_RESET_MESSAGE });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (typeof token !== 'string' || !token || typeof password !== 'string') {
      return res.status(400).json({ message: 'Token and new password are required' });
    }
    if (!isValidPassword(password)) {
      return res
        .status(400)
        .json({ message: 'Password must be at least 8 characters and include a letter and number' });
    }

    const user = await prisma.user.findUnique({ where: { resetPasswordToken: hashToken(token) } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or already used reset link' });
    }
    if (isExpired(user.resetPasswordExpires)) {
      return res.status(400).json({ message: 'Reset link has expired. Please request a new one.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, resetPasswordToken: null, resetPasswordExpires: null },
    });

    clearAuthCookie(res);
    res.json({ message: 'Password reset successfully. You can now log in.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      res.clearCookie('token');
      return res.status(401).json({ message: 'Authentication required' });
    }
    res.json({ user: publicUser(user) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const generateTwoFactorSetup = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    if (user.twoFactorEnabled) {
      return res.status(409).json({ message: 'Two-factor authentication is already enabled' });
    }

    const challenge = generateToken();
    const otp = generateOtp();
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        twoFactorChallenge: hashToken(challenge),
        twoFactorOtp: hashToken(otp),
        twoFactorChallengeExpires: minutesFromNow(10),
      },
    });
    await sendTwoFactorEmail(user.email, otp);
    res.json({ challenge });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const confirmTwoFactorSetup = async (req, res) => {
  try {
    const { challenge, otp } = req.body;
    if (typeof challenge !== 'string' || !challenge || !isValidOtp(otp)) {
      return res.status(400).json({ message: 'Challenge and a valid 6-digit code are required' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user || user.twoFactorChallenge !== hashToken(challenge) || isExpired(user.twoFactorChallengeExpires)) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }
    if (user.twoFactorOtp !== hashToken(otp)) {
      return res.status(401).json({ message: 'Incorrect verification code' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorEnabled: true, twoFactorChallenge: null, twoFactorOtp: null, twoFactorChallengeExpires: null },
    });

    res.json({ message: 'Two-factor authentication enabled', user: publicUser({ ...user, twoFactorEnabled: true }) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const disableTwoFactor = async (req, res) => {
  try {
    const { password } = req.body;
    if (typeof password !== 'string' || !password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorEnabled: false, twoFactorChallenge: null, twoFactorOtp: null, twoFactorChallengeExpires: null },
    });

    res.json({ message: 'Two-factor authentication disabled', user: publicUser({ ...user, twoFactorEnabled: false }) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const logout = (req, res) => {
  clearAuthCookie(res);
  res.json({ message: 'Logged out successfully' });
};

module.exports = {
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
};
