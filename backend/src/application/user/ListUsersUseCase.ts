import { UserRepo } from '@domain/ports/UserRepo';
import { User } from '@prisma/client';
import { Result, ok } from '@core/result';

export class ListUsersUseCase {
  constructor(private userRepo: UserRepo) {}

  async execute(): Promise<Result<User[], never>> {
    const users = await this.userRepo.findMany();
    return ok(users);
  }
}
