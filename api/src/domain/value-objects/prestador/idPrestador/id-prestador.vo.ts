import { ValueObjectBase } from "../../value-object.base";

/**
 * Id do prestador - `string`.
 */
export class IdPrestadorValueObject extends ValueObjectBase {
    readonly idPrestador: string

    /**
     * @param idPrestador - Aceita `any` para capturar inputs invalidos de runtime.
     * @throws {CampoObrigatorioVazioError} Se o idPrestador for nulo, undefined ou vazio.
     * @throws {FormatoInvalidoError} Se o idPrestador nao for uma `string`.
     */
    constructor(idPrestador: any) {
        super('idPrestador')

        this.validarString(idPrestador)

        this.idPrestador = idPrestador
    }
}
