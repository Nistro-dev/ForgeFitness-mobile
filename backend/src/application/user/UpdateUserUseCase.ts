import { UserRepo } from '@domain/ports/UserRepo';
import { User } from '@prisma/client';
import { Result, ok, err } from '@core/result';
import { AppError } from '@core/errors';

type Input = {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
};

export class UpdateUserUseCase {
  constructor(private userRepo: UserRepo) {}

  async execute(input: Input): Promise<Result<User, AppError>> {
    const user = await this.userRepo.findById(input.id);
    if (!user) {
      return err(AppError.badRequest('Utilisateur introuvable', 'USER_NOT_FOUND'));
    }

    if (input.email && input.email !== user.email) {
      const existingUser = await this.userRepo.findByEmail(input.email);
      if (existingUser) {
        return err(AppError.badRequest('Cet email est déjà utilisé', 'EMAIL_ALREADY_EXISTS'));
      }
    }

    await this.userRepo.update(input.id, {
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
    });

    const updatedUser = await this.userRepo.findById(input.id);
    return ok(updatedUser!);
  }
}
