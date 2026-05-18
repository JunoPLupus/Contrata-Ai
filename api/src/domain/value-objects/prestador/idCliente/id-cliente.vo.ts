import { ValueObjectBase } from "../../value-object.base";

/**
 * Id do cliente - `string`.
 */
export class IdClienteValueObject extends ValueObjectBase {
    readonly idCliente : string

    /**
     * @param idCliente - Aceita `any` para capturar inputs inválidos de runtime
     * (ex: campos ausentes no body HTTP) e lançar erros de domínio
     * em vez de `TypeError`.
     * @throws {CampoObrigatorioVazioError} Se o idCliente for nulo, undefined ou vazio.
     * @throws {FormatoInvalidoError} Se o idCliente não for uma `string`.
     */
    constructor(idCliente: any) {
        super('idCliente')

        this.validarString(idCliente)

        this.idCliente = idCliente
    }
}