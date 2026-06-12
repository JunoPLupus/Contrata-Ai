import { DomainError } from "./domain.error";

export class RecursoNaoEncontradoError extends DomainError {
    readonly statusCode: number = 404

    constructor(nomeRecurso : string) {
        super('RecursoNaoEncontradoError',
            `${nomeRecurso} não encontrado.`);
    }
}
