import { DomainError } from "./domain.error";

export class CampoObrigatorioVazioError extends DomainError {

    constructor(nomeCampo : string) {
        super('CampoObrigatorioVazioError',
            `O campo '${nomeCampo}' é obrigatório.`);
    }
}