import { DomainError } from "./domain.error";

export class AcessoProibidoError extends DomainError {
    readonly statusCode: number = 403

    constructor() {
        super('AcessoProibidoError',
            `Você não têm permissão para acessar este recurso.`)
    }
}