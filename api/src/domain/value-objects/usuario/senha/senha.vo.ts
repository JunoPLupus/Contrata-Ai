import { CampoObrigatorioVazioError } from "../../../errors/campo-obrigatorio-vazio.error";
import { ValorLimiteError } from "../../../errors/valor-limite.error";
import { FormatoInvalidoError } from "../../../errors/formato-invalido.error";

/**
 * Senha do usuário.
 * Mínimo: 6 caracteres. Máximo: 64 caracteres.
 */
export class SenhaUsuarioValueObject {
    private readonly _campo : string = 'senha'
    private readonly _limiteMinimo : number = 6
    private readonly _limiteMaximo : number = 64
    readonly senha: string

    /**
     * @param senha - Aceita `any` para capturar inputs inválidos de runtime
     * (ex: campos ausentes no body HTTP) e lançar erros de domínio
     * em vez de `TypeError`.
     * @throws {CampoObrigatorioVazioError} Se a senha for nula, undefined ou vazia.
     * @throws {FormatoInvalidoError} Se a senha não for uma `string`.
     * @throws {ValorLimiteError} Se a senha tiver menos de 6 ou mais de 64 caracteres.
     */
    constructor(senha: any) {

        if (this.isVazio(senha)) throw new CampoObrigatorioVazioError(this._campo)
        else if (typeof senha !== "string") throw new FormatoInvalidoError(this._campo)
        else if (this.isAbaixoLimite(senha)) throw new ValorLimiteError(this._campo, this._limiteMinimo, 'mínimo')
        else if (this.isAcimaLimite(senha)) throw new ValorLimiteError(this._campo, this._limiteMaximo, 'máximo')

        this.senha = senha
    }

    private isVazio(senha: string | undefined) : boolean {
        return senha == null || (typeof senha == "string" && senha.trim().length === 0)
    }

    private isAbaixoLimite(senha : string) : boolean {
        return senha.length < this._limiteMinimo
    }

    private isAcimaLimite(senha : string) : boolean {
        return senha.length > this._limiteMaximo
    }
}