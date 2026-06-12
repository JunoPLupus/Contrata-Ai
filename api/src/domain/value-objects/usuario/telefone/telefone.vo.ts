import validator from 'validator'

import { FormatoInvalidoError } from "../../../errors/formato-invalido.error";
import { ValueObjectBase } from "../../value-object.base";

/**
 * Value Object para campos de telefone/celular do usuário (`telefone` e `whatsapp`).
 * Aceita o número formatado (com espaços, parênteses, traços), validando
 * apenas os dígitos contra o formato de celular brasileiro.
 */
export class TelefoneUsuarioValueObject extends ValueObjectBase {
    readonly valor: string

    /**
     * @param campo - Nome do campo, usado nas mensagens de erro de domínio (`telefone` ou `whatsapp`).
     * @param valor - Número de telefone, com ou sem formatação.
     * @throws {CampoObrigatorioVazioError} Se o valor for nulo, undefined ou vazio.
     * @throws {FormatoInvalidoError} Se o valor não for uma `string` ou não for um número de celular brasileiro válido.
     */
    constructor(campo: string, valor: any) {
        super(campo)

        this.validarString(valor)

        const apenasDigitos = valor.replace(/\D/g, '')
        if (!validator.isMobilePhone(apenasDigitos, 'pt-BR')) throw new FormatoInvalidoError(this._campo)

        this.valor = valor
    }
}
