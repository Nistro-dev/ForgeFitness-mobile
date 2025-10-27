import { ActivateWithKeyUseCase } from '@app/auth/ActivateWithKeyUseCase';
import { IssueActivationKeyUseCase } from '@app/auth/IssueActivationKeyUseCase';
import { AdminLoginUseCase } from '@app/auth/AdminLoginUseCase';
import { IssueQrCodeUseCase } from '@app/qr/IssueQrCodeUseCase';
import { ResolveQrCodeUseCase } from '@app/qr/ResolveQrCodeUseCase';
import { CreateUserUseCase } from '@app/user/CreateUserUseCase';
import { ListUsersUseCase } from '@app/user/ListUsersUseCase';
import { UpdateUserUseCase } from '@app/user/UpdateUserUseCase';
import { DeleteUserUseCase } from '@app/user/DeleteUserUseCase';
import { UpdatePasswordUseCase } from '@app/user/UpdatePasswordUseCase';
import { UpdateRoleUseCase } from '@app/user/UpdateRoleUseCase';
import { UpdateStatusUseCase } from '@app/user/UpdateStatusUseCase';
import { CreateCategoryUseCase } from '@app/shop/CreateCategoryUseCase';
import { UpdateCategoryUseCase } from '@app/shop/UpdateCategoryUseCase';
import { ListCategoriesUseCase } from '@app/shop/ListCategoriesUseCase';
import { ActivationKeyRepoPrisma, DeviceRepoPrisma, NodemailerMailer, SessionRepoPrisma, UserRepoPrisma } from '@infra';
import { ProductRepoPrisma } from '../infrastructure/prisma/ProductRepoPrisma';
import { CategoryRepoPrisma } from '../infrastructure/prisma/CategoryRepoPrisma';
import { UserRepoPrismaAudit } from '../infrastructure/prisma/UserRepoPrismaAudit';
import { CategoryRepoPrismaAudit } from '../infrastructure/prisma/CategoryRepoPrismaAudit';
import { OrderRepoPrisma } from '../infrastructure/prisma/OrderRepoPrisma';
import { StockMovementRepoPrisma } from '../infrastructure/prisma/StockMovementRepoPrisma';
import { StripePaymentProvider } from '../infrastructure/payment/StripePaymentProvider';
import { PdfInvoiceGenerator } from '../infrastructure/invoice/PdfInvoiceGenerator';
import { RedisClient } from '../infrastructure/cache/RedisClient';
import { JWTService } from '../infrastructure/jwt/JWTService';
import { KeyManager } from '../infrastructure/crypto/KeyManager';
import { AuditLogService } from '../infrastructure/audit/AuditLogService';
import { asClass, createContainer, InjectionMode } from 'awilix';

export const makeContainer = () => {
  const container = createContainer({
    injectionMode: InjectionMode.CLASSIC,
  });

         container.register({
           userRepo: asClass(UserRepoPrismaAudit).singleton(),
           activationKeyRepo: asClass(ActivationKeyRepoPrisma).singleton(),
           sessionRepo: asClass(SessionRepoPrisma).singleton(),
           deviceRepo: asClass(DeviceRepoPrisma).singleton(),
           mailer: asClass(NodemailerMailer).singleton(),

           productRepo: asClass(ProductRepoPrisma).singleton(),
           categoryRepo: asClass(CategoryRepoPrismaAudit).singleton(),
           orderRepo: asClass(OrderRepoPrisma).singleton(),
           stockMovementRepo: asClass(StockMovementRepoPrisma).singleton(),

    paymentProvider: asClass(StripePaymentProvider).singleton(),
    invoiceGenerator: asClass(PdfInvoiceGenerator).singleton(),

           redisClient: asClass(RedisClient).singleton(),
           jwtService: asClass(JWTService).singleton(),
           keyManager: asClass(KeyManager).singleton(),
           auditLogService: asClass(AuditLogService).singleton(),

    issueActivationKeyUseCase: asClass(IssueActivationKeyUseCase).scoped(),
    activateWithKeyUseCase: asClass(ActivateWithKeyUseCase).scoped(),
    adminLoginUseCase: asClass(AdminLoginUseCase).scoped(),
    issueQrCodeUseCase: asClass(IssueQrCodeUseCase).scoped(),
    resolveQrCodeUseCase: asClass(ResolveQrCodeUseCase).scoped(),
    
    createUserUseCase: asClass(CreateUserUseCase).scoped(),
    listUsersUseCase: asClass(ListUsersUseCase).scoped(),
    updateUserUseCase: asClass(UpdateUserUseCase).scoped(),
    deleteUserUseCase: asClass(DeleteUserUseCase).scoped(),
    updatePasswordUseCase: asClass(UpdatePasswordUseCase).scoped(),
    updateRoleUseCase: asClass(UpdateRoleUseCase).scoped(),
    updateStatusUseCase: asClass(UpdateStatusUseCase).scoped(),
    
    createCategoryUseCase: asClass(CreateCategoryUseCase).scoped(),
    updateCategoryUseCase: asClass(UpdateCategoryUseCase).scoped(),
    listCategoriesUseCase: asClass(ListCategoriesUseCase).scoped(),
  });

  return container;
};