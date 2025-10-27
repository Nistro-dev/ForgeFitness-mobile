import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function setAdminPassword() {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.log('Usage: npm run set-admin-password <email> <password>');
    process.exit(1);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log(`❌ Utilisateur avec l'email ${email} non trouvé`);
      process.exit(1);
    }

    if (user.role !== 'ADMIN' && user.role !== 'COACH') {
      console.log(`❌ L'utilisateur ${email} n'a pas le rôle ADMIN ou COACH (rôle actuel: ${user.role})`);
      process.exit(1);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    console.log(`✅ Mot de passe défini pour ${email} (${user.role})`);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

setAdminPassword();
