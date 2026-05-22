import { ValueObjectBase } from "../../value-object.base";

/**
 * Preco maximo do servico - `number`.
 * Minimo: 1.
 */
export class PrecoMaxValueObject extends ValueObjectBase {
    readonly precoMax: number

    /**
     * @param precoMax - Aceita `any` para capturar inputs invalidos de runtime.
     * @throws {FormatoInvalidoError} Se o precoMax nao for um `number`.
     * @throws {ValorLimiteError} Se o precoMax for menor que 1.
     */
    constructor(precoMax: any) {
        super('precoMax', 1)

        this.validarNumber(precoMax)

        this.precoMax = precoMax
    }
}
