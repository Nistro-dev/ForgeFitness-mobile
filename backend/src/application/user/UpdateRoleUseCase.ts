import { UserRepo } from '@domain/ports/UserRepo';
import { UserRole } from '@prisma/client';
import { Result, ok, err } from '@core/result';
import { AppError } from '@core/errors';

type Input = {
  id: string;
  role: UserRole;
};

export class UpdateRoleUseCase {
  constructor(private userRepo: UserRepo) {}

  async execute(input: Input): Promise<Result<void, AppError>> {
    const user = await this.userRepo.findById(input.id);
    if (!user) {
      return err(AppError.badRequest('Utilisateur introuvable', 'USER_NOT_FOUND'));
    }

    await this.userRepo.updateRole(input.id, input.role);
    return ok(undefined);
  }
}
