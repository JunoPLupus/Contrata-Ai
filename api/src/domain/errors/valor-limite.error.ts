import { DomainError } from "./domain.error";

export class ValorLimiteError extends DomainError {
    readonly statusCode: number = 422

    constructor(nomeCampo : string, limite : number, tipo: 'mínimo' | 'máximo', isNumero : boolean = false) {
        let mensagem = `O campo '${nomeCampo}' `
        mensagem = isNumero?
            mensagem + `deve ser no ${tipo} ${limite}.` :
            mensagem + `deve conter no ${tipo} ${limite} caracteres.`

        super('ValorLimiteError', mensagem);
    }
}