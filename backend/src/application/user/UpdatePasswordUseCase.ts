import { UserRepo } from '@domain/ports/UserRepo';
import { Result, ok, err } from '@core/result';
import { AppError } from '@core/errors';
import bcrypt from 'bcryptjs';

type Input = {
  id: string;
  password: string;
};

export class UpdatePasswordUseCase {
  constructor(private userRepo: UserRepo) {}

  async execute(input: Input): Promise<Result<void, AppError>> {
    const user = await this.userRepo.findById(input.id);
    if (!user) {
      return err(AppError.badRequest('Utilisateur introuvable', 'USER_NOT_FOUND'));
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);
    await this.userRepo.setPassword(input.id, hashedPassword);

    return ok(undefined);
  }
}
