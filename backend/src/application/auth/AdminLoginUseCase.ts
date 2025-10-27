import { UserRepo } from '@domain/ports/UserRepo';
import { SessionRepo } from '@domain/ports/SessionRepo';
import { AppError } from '@core/errors';
import { UserRole } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { addDays } from 'date-fns';
import { env } from '@config/env';

type Input = {
  email: string;
  password: string;
};

type Output = {
  token: string;
  expiresAt: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
};

export class AdminLoginUseCase {
  constructor(
    private userRepo: UserRepo,
    private sessionRepo: SessionRepo,
  ) {}

  async execute(input: Input): Promise<Output> {
    const user = await this.userRepo.findByEmail(input.email);
    if (!user) {
      throw AppError.badRequest('INVALID_CREDENTIALS');
    }

    if (user.role !== UserRole.ADMIN && user.role !== UserRole.COACH) {
      throw AppError.badRequest('INSUFFICIENT_PRIVILEGES');
    }

    if (!user.password) {
      throw AppError.badRequest('NO_PASSWORD_SET');
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.password);
    if (!isPasswordValid) {
      throw AppError.badRequest('INVALID_CREDENTIALS');
    }

    if (user.status !== 'ACTIVE') {
      throw AppError.badRequest('ACCOUNT_DISABLED');
    }

    await this.sessionRepo.revokeAllForUser(user.id);

    const now = new Date();
    const sessionTtlDays = 7; // Sessions admin plus courtes pour la sécurité
    const session = await this.sessionRepo.create({
      userId: user.id,
      deviceId: null, // Pas de device pour les connexions web admin
      expiresAt: addDays(now, sessionTtlDays),
    });

    const token = jwt.sign(
      { 
        sub: user.id, 
        sid: session.id, 
        role: user.role,
        type: 'admin' // Marquer comme token admin
      },
      env.JWT_SECRET,
      { 
        expiresIn: `${sessionTtlDays}d`, 
        issuer: 'forge-fitness-admin' 
      },
    );

    return {
      token,
      expiresAt: addDays(now, sessionTtlDays).toISOString(),
      user: { 
        id: user.id, 
        email: user.email, 
        firstName: user.firstName, 
        lastName: user.lastName, 
        role: user.role 
      },
    };
  }
}
