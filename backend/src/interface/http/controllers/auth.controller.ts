import { FastifyRequest, FastifyReply } from 'fastify';
import { IssueKeyDto, ActivateDto } from '@if/dtos/auth.dto';
import { IssueActivationKeyUseCase } from '@app/auth/IssueActivationKeyUseCase';
import { ActivateWithKeyUseCase } from '@app/auth/ActivateWithKeyUseCase';

export class AuthController {
  constructor(
    private issueActivationKeyUseCase: IssueActivationKeyUseCase,
    private activateWithKeyUseCase: ActivateWithKeyUseCase
  ) {}

  issue = async (req: FastifyRequest, rep: FastifyReply) => {
    const input = IssueKeyDto.parse(req.body);
    await this.issueActivationKeyUseCase.exec(input);
    return rep.send({ ok: true });
  }

  activateWithKey = async (req: FastifyRequest, rep: FastifyReply) => {
    const input = ActivateDto.parse(req.body);
    const out = await this.activateWithKeyUseCase.exec(input);
    return rep.send(out);
  }
}