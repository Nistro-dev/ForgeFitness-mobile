import { UserRepo } from '@domain/ports/UserRepo';
import { User, UserRole, UserStatus } from '@prisma/client';
import { Result, ok, err } from '@core/result';
import { AppError } from '@core/errors';
import bcrypt from 'bcryptjs';

type Input = {
  email: string;
  firstName: string;
  lastName: string;
  password?: string;
  role: UserRole;
  status: UserStatus;
};

type Output = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
};

export class CreateUserUseCase {
  constructor(private userRepo: UserRepo) {}

  async execute(input: Input): Promise<Result<Output, AppError>> {
    const existingUser = await this.userRepo.findByEmail(input.email);
    if (existingUser) {
      return err(AppError.badRequest('Cet email est déjà utilisé', 'EMAIL_ALREADY_EXISTS'));
    }

    let hashedPassword: string | undefined;
    if (input.password) {
      hashedPassword = await bcrypt.hash(input.password, 10);
    }

    const user = await this.userRepo.create({
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      password: hashedPassword,
      role: input.role,
      status: input.status,
    });

    return ok({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
    });
  }
}
