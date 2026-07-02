import { DomainError } from "./domain.error";

export class FormatoInvalidoError extends DomainError {
    readonly statusCode: number = 422

    constructor(nomeCampo : string) {
        super('FormatoInvalidoError',
            `O '${nomeCampo}' inserido é inválido. Verifique o formato e tente novamente.`);
    }
}