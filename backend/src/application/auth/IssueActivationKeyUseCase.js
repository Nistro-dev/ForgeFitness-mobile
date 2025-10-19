import { randomBytes } from 'crypto';
export class IssueActivationKeyUseCase {
    users;
    keys;
    mailer;
    constructor(users, keys, mailer) {
        this.users = users;
        this.keys = keys;
        this.mailer = mailer;
    }
    async exec({ email, fullName, role }) {
        // upsert simple
        let user = await this.users.findByEmail(email);
        if (!user) {
            user = await this.users.create({ email, fullName, role: role });
        }
        const code = randomBytes(6).toString('hex');
        const expiresAt = new Date(Date.now() + 48 * 3600 * 1000);
        await this.keys.createForUser(user.id, code, expiresAt);
        await this.mailer.send(email, 'Votre clé d\'activation Forge Fitness', `<p>Voici votre clé : <b>${code}</b> (valable 48h)</p>`, `Clé: ${code}`);
    }
}
