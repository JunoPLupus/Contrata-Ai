import { CampoObrigatorioVazioError } from "../../../errors/campo-obrigatorio-vazio.error";
import { ValorLimiteError } from "../../../errors/valor-limite.error";
import { FormatoInvalidoError } from "../../../errors/formato-invalido.error";

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

    /**
     * @param nome - Aceita `any` para capturar inputs inválidos de runtime
     * (ex: campos ausentes no body HTTP) e lançar erros de domínio
     * em vez de `TypeError`.
     * @throws {CampoObrigatorioVazioError} Se o nome for nulo, undefined ou vazio.
     * @throws {FormatoInvalidoError} Se o nome não for uma `string`.
     * @throws {ValorLimiteError} Se o nome tiver menos de 3 ou mais de 150 caracteres.
     */
    constructor(nome: any) {
        if (this.isVazio(nome)) throw new CampoObrigatorioVazioError(this._campo)
        else if (typeof nome != "string") throw new FormatoInvalidoError(this._campo)
        else if (this.isAbaixoLimite(nome)) throw new ValorLimiteError(this._campo, this._limiteMinimo, 'mínimo')
        else if (this.isAcimaLimite(nome)) throw new ValorLimiteError(this._campo, this._limiteMaximo, 'máximo')

        this.nome = nome
    }

    private isVazio(nome: string | undefined) : boolean {
        return nome == null || (typeof nome == "string" && nome.trim().length === 0)
    }

    private isAbaixoLimite(nome : string) : boolean {
        return nome.trim().length < this._limiteMinimo
    }

    private isAcimaLimite(nome : string) : boolean {
        return nome.trim().length > this._limiteMaximo
    }
}