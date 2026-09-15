const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');

const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
  return next();
};

const requireAdmin = async (req, res, next) => {
  if (!req.user?.id) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { role: true },
    });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    return next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to verify admin access' });
  }
};

module.exports = { verifyToken, requireAdmin };
