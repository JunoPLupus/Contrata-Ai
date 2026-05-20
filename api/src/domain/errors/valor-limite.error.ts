import { DomainError } from "./domain.error";

export class ValorLimiteError extends DomainError {
    readonly statusCode: number = 422

    constructor(nomeCampo : string, limite : number, tipo: 'mínimo' | 'máximo') {
        super('ValorLimiteError',
            `O campo '${nomeCampo}' deve conter no ${tipo} ${limite} caracteres.`);
    }
}