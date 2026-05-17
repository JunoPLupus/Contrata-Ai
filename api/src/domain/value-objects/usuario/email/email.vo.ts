import validator from 'validator'

import { CampoObrigatorioVazioError } from "../../../errors/campo-obrigatorio-vazio.error";
import { FormatoInvalidoError } from "../../../errors/formato-invalido.error";
/**
 * E-mail do usuário.
 * O campo email é validado pela biblioteca validator para maior simplicidade do código.
 */
export class EmailUsuarioValueObject {
    private readonly _campo : string = 'email'
    readonly email: string

    /**
     * @param email - Aceita `any` para capturar inputs inválidos de runtime
     * (ex: campos ausentes no body HTTP) e lançar erros de domínio
     * em vez de `TypeError`.
     * @throws {CampoObrigatorioVazioError} Se o email for nulo, undefined ou vazio.
     * @throws {FormatoInvalidoError} Se o email não for uma `string` ou não passar na validação de formato.
     */
    constructor(email: any) {
        if (this.isVazio(email)) throw new CampoObrigatorioVazioError(this._campo)
        else if (typeof email != "string" || !validator.isEmail(email)) throw new FormatoInvalidoError(this._campo)

        this.email = email
    }

    private isVazio(email: string | undefined) : boolean {
        return email == undefined || (typeof email == "string" && email.trim().length === 0)
    }
}