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

    constructor(email: string) {

        if (this.isVazio(email)) throw new CampoObrigatorioVazioError(this._campo)
        else if (!validator.isEmail(email)) throw new FormatoInvalidoError(this._campo)

        this.email = email
    }

    private isVazio(email: string) : boolean {
        return email.trim().length === 0
    }
}