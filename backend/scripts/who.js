const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, emailVerified: true, emailVerificationToken: true, twoFactorEnabled: true },
  });
  users.forEach((u) => console.log(u.id, u.email, `verified=${u.emailVerified}`, `hasToken=${!!u.emailVerificationToken}`, `2fa=${u.twoFactorEnabled}`));
  await prisma.$disconnect();
})();