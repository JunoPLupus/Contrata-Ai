import validator from 'validator'

import { FormatoInvalidoError } from "../../../errors/formato-invalido.error";
import { ValueObjectBase } from "../../value-object.base";
/**
 * E-mail do usuário - `string`.
 * O campo email é validado pela biblioteca validator para maior simplicidade do código.
 */
export class EmailUsuarioValueObject extends ValueObjectBase {
    readonly email: string

    /**
     * @param email - Aceita `any` para capturar inputs inválidos de runtime
     * (ex: campos ausentes no body HTTP) e lançar erros de domínio
     * em vez de `TypeError`.
     * @throws {CampoObrigatorioVazioError} Se o email for nulo, undefined ou vazio.
     * @throws {FormatoInvalidoError} Se o email não for uma `string` ou não passar na validação de formato.
     */
    constructor(email: any) {
        super('email')

        this.validarString(email)
        if (!validator.isEmail(email)) throw new FormatoInvalidoError(this._campo)

        this.email = email
    }
}