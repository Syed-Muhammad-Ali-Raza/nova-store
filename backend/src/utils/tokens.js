const crypto = require('crypto');

const generateToken = () => crypto.randomBytes(32).toString('hex');

const generateOtp = () => String(crypto.randomInt(100000, 999999));

const hashToken = (value) => crypto.createHash('sha256').update(value).digest('hex');

const isExpired = (date) => {
  if (!date) return true;
  return new Date() > new Date(date);
};

const hoursFromNow = (hours) => new Date(Date.now() + hours * 60 * 60 * 1000);

const minutesFromNow = (minutes) => new Date(Date.now() + minutes * 60 * 1000);

module.exports = { generateToken, generateOtp, hashToken, isExpired, hoursFromNow, minutesFromNow };
