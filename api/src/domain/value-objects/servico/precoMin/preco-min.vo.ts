import { ValueObjectBase } from "../../value-object.base";

/**
 * Preco minimo do servico - `number`.
 * Minimo: 1.
 */
export class PrecoMinValueObject extends ValueObjectBase {
    readonly precoMin: number

    /**
     * @param precoMin - Aceita `any` para capturar inputs invalidos de runtime.
     * @throws {FormatoInvalidoError} Se o precoMin nao for um `number`.
     * @throws {ValorLimiteError} Se o precoMin for menor que 1.
     */
    constructor(precoMin: any) {
        super('precoMin', 1)

        this.validarNumber(precoMin)

        this.precoMin = precoMin
    }
}
