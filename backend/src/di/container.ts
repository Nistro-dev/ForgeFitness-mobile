import { ActivateWithKeyUseCase } from '@app/auth/ActivateWithKeyUseCase';
import { IssueActivationKeyUseCase } from '@app/auth/IssueActivationKeyUseCase';
import { ActivationKeyRepoPrisma, DeviceRepoPrisma, NodemailerMailer, SessionRepoPrisma, UserRepoPrisma } from '@infra';
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

    issueActivationKeyUseCase: asClass(IssueActivationKeyUseCase).scoped(),
    activateWithKeyUseCase: asClass(ActivateWithKeyUseCase).scoped(),
  });

  return container;
};