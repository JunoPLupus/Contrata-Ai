import { ValueObjectBase } from "../../value-object.base";

/**
 * Descrição do serviço - `string`.
 * Mínimo: 5 caracteres. Máximo: 500 caracteres.
 */
export class DescricaoValueObject extends ValueObjectBase {
    readonly descricao: string

    /**
     * @param descricao - Aceita `any` para capturar inputs inválidos de runtime.
     * @throws {CampoObrigatorioVazioError} Se a descrição for nula, undefined ou vazia.
     * @throws {FormatoInvalidoError} Se a descrição nao for uma `string`.
     * @throws {ValorLimiteError} Se a descrição tiver menos de 5 ou mais de 500 caracteres.
     */
    constructor(descricao: any) {
        super('descricao', 5, 500)

        this.validarString(descricao)

        this.descricao = descricao
    }
}
