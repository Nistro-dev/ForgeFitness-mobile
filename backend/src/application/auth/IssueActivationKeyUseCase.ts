import { ActivationKeyRepo } from '@domain/ports/ActivationKeyRepo';
import { UserRepo } from '@domain/ports/UserRepo';
import { Mailer } from '@domain/ports/Mailer';
import { randomBytes } from 'crypto';

type Input = { email: string; fullName: string; role: 'MEMBER' | 'COACH' | 'ADMIN' };

export class IssueActivationKeyUseCase {
  constructor(
    private users: UserRepo,
    private keys: ActivationKeyRepo,
    private mailer: Mailer
  ) {}

  async exec({ email, fullName, role }: Input): Promise<void> {
    let user = await this.users.findByEmail(email);
    if (!user) {
      user = await this.users.create({ email, fullName, role: role as any });
    }

    const code = randomBytes(6).toString('hex');
    const expiresAt = new Date(Date.now() + 48 * 3600 * 1000);

    await this.keys.createForUser(user.id, code, expiresAt);

    await this.mailer.send(
      email,
      'Votre clé d\'activation Forge Fitness',
      `<p>Voici votre clé : <b>${code}</b> (valable 48h)</p>`,
      `Clé: ${code}`
    );
  }
}
