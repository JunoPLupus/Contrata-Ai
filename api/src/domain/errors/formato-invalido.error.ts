import { DomainError } from "./domain.error";

export class FormatoInvalidoError extends DomainError {
    constructor(nomeCampo : string) {
        super('FormatoInvalidoError',
            `O '${nomeCampo}' inserido é inválido. Verifique o formato e tente novamente.`);
    }
}