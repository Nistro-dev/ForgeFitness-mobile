import { prisma } from './client';
export class UserRepoPrisma {
    async findByEmail(email) {
        const u = await prisma.user.findUnique({ where: { email } });
        return u ? { ...u } : null;
    }
    async findByDeviceId(deviceId) {
        const u = await prisma.user.findFirst({ where: { deviceId } });
        return u ? { ...u } : null;
    }
    async create(data) {
        const u = await prisma.user.create({ data });
        return { ...u };
    }
    async bindDevice(userId, deviceId) {
        await prisma.user.update({
            where: { id: userId },
            data: { deviceId },
        });
    }
}
