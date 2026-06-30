import { DomainError } from "./domain.error";

export class OperacaoNaoPermitidaError extends DomainError {
    readonly statusCode: number = 422

    constructor(motivo: string) {
        super('OperacaoNaoPermitidaError', motivo)
    }
}
