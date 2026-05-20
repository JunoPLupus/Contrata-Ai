import { DomainError } from "./domain.error";

export class CredenciaisInvalidasError extends DomainError {
    readonly statusCode: number = 401

    constructor() {
        super('CredenciaisInvalidasError',
            'Credenciais inválidas! Verifique suas credenciais e tente novamente.');
    }
}