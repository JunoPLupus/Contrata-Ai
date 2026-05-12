import { DomainError } from "./domain.error";

export class EmailJaCadastradoError extends DomainError {

    constructor() {
        super('EmailJaCadastradoError',
            'E-mail indisponível.');
    }
}