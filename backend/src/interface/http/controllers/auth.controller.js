import { IssueKeyDto, ActivateDto } from '@if/dtos/auth.dto';
export class AuthController {
    issueActivationKeyUseCase;
    activateWithKeyUseCase;
    constructor(issueActivationKeyUseCase, activateWithKeyUseCase) {
        this.issueActivationKeyUseCase = issueActivationKeyUseCase;
        this.activateWithKeyUseCase = activateWithKeyUseCase;
    }
    issue = async (req, rep) => {
        const input = IssueKeyDto.parse(req.body);
        await this.issueActivationKeyUseCase.exec(input);
        return rep.send({ ok: true });
    };
    activateWithKey = async (req, rep) => {
        const input = ActivateDto.parse(req.body);
        const out = await this.activateWithKeyUseCase.exec(input);
        return rep.send(out);
    };
}
