import { ActivateWithKeyUseCase } from '@app/auth/ActivateWithKeyUseCase';
import { IssueActivationKeyUseCase } from '@app/auth/IssueActivationKeyUseCase';
import { AdminLoginUseCase } from '@app/auth/AdminLoginUseCase';
import { IssueQrCodeUseCase } from '@app/qr/IssueQrCodeUseCase';
import { ResolveQrCodeUseCase } from '@app/qr/ResolveQrCodeUseCase';
import { ActivationKeyRepoPrisma, DeviceRepoPrisma, NodemailerMailer, SessionRepoPrisma, UserRepoPrisma } from '@infra';
import { ProductRepoPrisma } from '../infrastructure/prisma/ProductRepoPrisma';
import { CategoryRepoPrisma } from '../infrastructure/prisma/CategoryRepoPrisma';
import { OrderRepoPrisma } from '../infrastructure/prisma/OrderRepoPrisma';
import { StockMovementRepoPrisma } from '../infrastructure/prisma/StockMovementRepoPrisma';
import { StripePaymentProvider } from '../infrastructure/payment/StripePaymentProvider';
import { PdfInvoiceGenerator } from '../infrastructure/invoice/PdfInvoiceGenerator';
import { RedisClient } from '../infrastructure/cache/RedisClient';
import { JWTService } from '../infrastructure/jwt/JWTService';
import { KeyManager } from '../infrastructure/crypto/KeyManager';
import { asClass, createContainer, InjectionMode } from 'awilix';

export const makeContainer = () => {
  const container = createContainer({
    injectionMode: InjectionMode.CLASSIC,
  });

  container.register({
    userRepo: asClass(UserRepoPrisma).singleton(),
    activationKeyRepo: asClass(ActivationKeyRepoPrisma).singleton(),
    sessionRepo: asClass(SessionRepoPrisma).singleton(),
    deviceRepo: asClass(DeviceRepoPrisma).singleton(),
    mailer: asClass(NodemailerMailer).singleton(),

    productRepo: asClass(ProductRepoPrisma).singleton(),
    categoryRepo: asClass(CategoryRepoPrisma).singleton(),
    orderRepo: asClass(OrderRepoPrisma).singleton(),
    stockMovementRepo: asClass(StockMovementRepoPrisma).singleton(),

    paymentProvider: asClass(StripePaymentProvider).singleton(),
    invoiceGenerator: asClass(PdfInvoiceGenerator).singleton(),

    redisClient: asClass(RedisClient).singleton(),
    jwtService: asClass(JWTService).singleton(),
    keyManager: asClass(KeyManager).singleton(),

    issueActivationKeyUseCase: asClass(IssueActivationKeyUseCase).scoped(),
    activateWithKeyUseCase: asClass(ActivateWithKeyUseCase).scoped(),
    adminLoginUseCase: asClass(AdminLoginUseCase).scoped(),
    issueQrCodeUseCase: asClass(IssueQrCodeUseCase).scoped(),
    resolveQrCodeUseCase: asClass(ResolveQrCodeUseCase).scoped(),
  });

  return container;
};