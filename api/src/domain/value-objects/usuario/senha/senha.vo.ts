import { CampoObrigatorioVazioError } from "../../../errors/campo-obrigatorio-vazio.error";
import { ValorLimiteError } from "../../../errors/valor-limite.error";

/**
 * Senha do usuário.
 * Mínimo: 6 caracteres. Máximo: 64 caracteres.
 */
export class SenhaUsuarioValueObject {
    private readonly _campo : string = 'senha'
    private readonly _limiteMinimo : number = 6
    private readonly _limiteMaximo : number = 64
    readonly senha: string

    constructor(senha: string) {

        if (this.isVazio(senha.trim())) throw new CampoObrigatorioVazioError(this._campo)
        else if (this.isAbaixoLimite(senha)) throw new ValorLimiteError(this._campo, this._limiteMinimo, 'mínimo')
        else if (this.isAcimaLimite(senha)) throw new ValorLimiteError(this._campo, this._limiteMaximo, 'máximo')

        this.senha = senha
    }

    private isVazio(senha: string) : boolean {
        return senha.length === 0
    }

    private isAbaixoLimite(senha : string) : boolean {
        return senha.length < this._limiteMinimo
    }

    private isAcimaLimite(senha : string) : boolean {
        return senha.length > this._limiteMaximo
    }
}