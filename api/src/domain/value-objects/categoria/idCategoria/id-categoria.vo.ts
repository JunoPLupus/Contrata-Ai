import { ValueObjectBase } from "../../value-object.base";

/**
 * Id da categoria - `string`.
 */
export class IdCategoriaValueObject extends ValueObjectBase {
    readonly idCategoria: string

    /**
     * @param idCategoria - Aceita `any` para capturar inputs invalidos de runtime.
     * @throws {CampoObrigatorioVazioError} Se o idCategoria for nulo, undefined ou vazio.
     * @throws {FormatoInvalidoError} Se o idCategoria nao for uma `string`.
     */
    constructor(idCategoria: any) {
        super('idCategoria')

        this.validarString(idCategoria)

        this.idCategoria = idCategoria
    }
}
