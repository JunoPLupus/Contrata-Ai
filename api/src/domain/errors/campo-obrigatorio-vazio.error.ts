import { DomainError } from "./domain.error";

export class CampoObrigatorioVazioError extends DomainError {
    readonly statusCode: number = 422

    constructor(nomeCampo : string) {
        super('CampoObrigatorioVazioError',
            `O campo '${nomeCampo}' é obrigatório.`);
    }
}