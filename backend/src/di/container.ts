import { createContainer, asClass } from 'awilix';
import { UserRepoPrisma } from '@infra/prisma/UserRepoPrisma';
import { ActivationKeyRepoPrisma } from '@infra/prisma/ActivationKeyRepoPrisma';
import { NodemailerMailer } from '@infra/mail/NodemailerMailer';
import { IssueActivationKeyUseCase } from '@app/auth/IssueActivationKeyUseCase';
import { ActivateWithKeyUseCase } from '@app/auth/ActivateWithKeyUseCase';
import { AuthController } from '@if/http/controllers/auth.controller';

export const container = createContainer({ injectionMode: 'CLASSIC' });

container.register({
  users: asClass(UserRepoPrisma).singleton(),
  keys: asClass(ActivationKeyRepoPrisma).singleton(),
  mailer: asClass(NodemailerMailer).singleton(),

  issueActivationKeyUseCase: asClass(IssueActivationKeyUseCase).singleton(),
  activateWithKeyUseCase: asClass(ActivateWithKeyUseCase).singleton(),

  authController: asClass(AuthController).singleton(),
});