import { ValueObjectBase } from "../../value-object.base";

/**
 * Prazo medio do servico - `number`.
 * Minimo: 1.
 */
export class PrazoMedioValueObject extends ValueObjectBase {
    readonly prazoMedio: number

    /**
     * @param prazoMedio - Aceita `any` para capturar inputs invalidos de runtime.
     * @throws {FormatoInvalidoError} Se o prazoMedio nao for um `number`.
     * @throws {ValorLimiteError} Se o prazoMedio for menor que 1.
     */
    constructor(prazoMedio: any) {
        super('prazoMedio', 1)

        this.validarNumber(prazoMedio)

        this.prazoMedio = prazoMedio
    }
}
