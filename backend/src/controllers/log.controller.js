const prisma = require('../utils/prisma');

const createLog = async (req, res) => {
  try {
    const { action, metadata } = req.body;
    const userId = req.user.id;
    const log = await prisma.activityLog.create({
      data: { userId, action, metadata: metadata || {} },
    });
    res.status(201).json(log);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await prisma.activityLog.count();
    const logs = await prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, email: true, role: true } } },
      skip,
      take: parseInt(limit),
    });
    res.json({ logs, total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { createLog, getLogs };