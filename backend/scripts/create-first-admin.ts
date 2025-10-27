import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createFirstAdmin() {
  const email = process.argv[2];
  const password = process.argv[3];
  const firstName = process.argv[4] || 'Admin';
  const lastName = process.argv[5] || 'User';

  if (!email || !password) {
    console.log('Usage: npm run create-admin <email> <password> [firstName] [lastName]');
    console.log('Example: npm run create-admin admin@forge-fitness.com admin123 "John" "Doe"');
    process.exit(1);
  }

  try {
    const existingAdmin = await prisma.user.findFirst({
      where: {
        role: 'ADMIN',
      },
    });

    if (existingAdmin) {
      console.log(`⚠️  Un admin existe déjà: ${existingAdmin.email}`);
      console.log('Utilisez "npm run set-admin-password" pour changer le mot de passe d\'un admin existant.');
      process.exit(1);
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log(`❌ Un utilisateur avec l'email ${email} existe déjà`);
      process.exit(1);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const admin = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        password: hashedPassword,
        role: 'ADMIN',
        status: 'ACTIVE',
      },
    });

    console.log('✅ Premier admin créé avec succès !');
    console.log(`📧 Email: ${admin.email}`);
    console.log(`👤 Nom: ${admin.firstName} ${admin.lastName}`);
    console.log(`🔑 Rôle: ${admin.role}`);
    console.log(`📅 Créé le: ${admin.createdAt.toISOString()}`);
    console.log('');
    console.log('🚀 Vous pouvez maintenant vous connecter via:');
    console.log('   POST /api/admin/auth/login');
    console.log(`   {"email": "${admin.email}", "password": "${password}"}`);
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'admin:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createFirstAdmin();
