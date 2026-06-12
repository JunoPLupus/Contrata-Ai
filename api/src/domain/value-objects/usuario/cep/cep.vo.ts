import validator from 'validator'

import { FormatoInvalidoError } from "../../../errors/formato-invalido.error";
import { ValueObjectBase } from "../../value-object.base";

/**
 * Value Object para o campo `localizacaoCep` do usuário.
 * Valida o formato de CEP brasileiro (com ou sem traço).
 */
export class CepValueObject extends ValueObjectBase {
    readonly valor: string

    /**
     * @param valor - CEP, com ou sem traço (ex: `01000-000` ou `01000000`).
     * @throws {CampoObrigatorioVazioError} Se o valor for nulo, undefined ou vazio.
     * @throws {FormatoInvalidoError} Se o valor não for uma `string` ou não for um CEP válido.
     */
    constructor(valor: any) {
        super('localizacaoCep')

        this.validarString(valor)

        if (!validator.isPostalCode(valor, 'BR')) throw new FormatoInvalidoError(this._campo)

        this.valor = valor
    }
}
