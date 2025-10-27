import { UserRepo } from '@domain/ports/UserRepo';
import { Result, ok, err } from '@core/result';
import { AppError } from '@core/errors';

type Input = string;

export class DeleteUserUseCase {
  constructor(private userRepo: UserRepo) {}

  async execute(input: Input): Promise<Result<void, AppError>> {
    const user = await this.userRepo.findById(input);
    if (!user) {
      return err(AppError.badRequest('Utilisateur introuvable', 'USER_NOT_FOUND'));
    }

    await this.userRepo.delete(input);
    return ok(undefined);
  }
}
