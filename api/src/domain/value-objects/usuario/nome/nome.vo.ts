import { CampoObrigatorioVazioError } from "../../../errors/campo-obrigatorio-vazio.error";
import { ValorLimiteError } from "../../../errors/valor-limite.error";

/**
 * Nome do usuário.
 * Valor é armazenado sem espaços nas extremidades (trim aplicado na construção).
 * Mínimo: 3 caracteres. Máximo: 150 caracteres.
 */
export class NomeUsuarioValueObject {
    private readonly _campo : string = 'nome'
    private readonly _limiteMinimo : number = 3
    private readonly _limiteMaximo : number = 150
    readonly nome: string

    constructor(nome: string) {
        const nomeRecebido : string = nome.trim()

        if (this.isVazio(nomeRecebido)) throw new CampoObrigatorioVazioError(this._campo)
        else if (this.isAbaixoLimite(nomeRecebido)) throw new ValorLimiteError(this._campo, this._limiteMinimo, 'mínimo')
        else if (this.isAcimaLimite(nomeRecebido)) throw new ValorLimiteError(this._campo, this._limiteMaximo, 'máximo')

        this.nome = nomeRecebido
    }

    private isVazio(nome: string) : boolean {
        return nome.length === 0
    }

    private isAbaixoLimite(nome : string) : boolean {
        return nome.length < this._limiteMinimo
    }

    private isAcimaLimite(nome : string) : boolean {
        return nome.length > this._limiteMaximo
    }
}