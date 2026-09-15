const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const res = await prisma.user.updateMany({
      where: { emailVerified: false },
      data: { emailVerified: true },
    });
    console.log('backfilled verified users:', res.count);
  } catch (err) {
    console.error('backfill failed:', err.message);
  } finally {
    await prisma.$disconnect();
  }
})();