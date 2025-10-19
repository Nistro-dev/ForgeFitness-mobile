import { prisma } from './client';
export class ActivationKeyRepoPrisma {
    async createForUser(userId, code, expiresAt) {
        await prisma.activationKey.create({
            data: { userId, code, expiresAt },
        });
    }
    async findByCode(code) {
        const k = await prisma.activationKey.findUnique({ where: { code } });
        return k ? { ...k } : null;
    }
    async markUsed(code) {
        await prisma.activationKey.update({
            where: { code },
            data: { usedAt: new Date() },
        });
    }
}
