import { ValueObjectBase } from "../../value-object.base";

/**
 * Value Object genérico para campos `boolean` recebidos de fora do domínio
 * (ex: `atendimentoDomiciliar`). Garante que valores como `"true"` ou `1`
 * virem erro de domínio em vez de chegarem ao banco.
 */
export class BooleanValueObject extends ValueObjectBase {
    readonly valor: boolean

    /**
     * @param campo - Nome do campo, usado nas mensagens de erro de domínio.
     * @param valor - Aceita `any` para capturar inputs inválidos de runtime.
     * @throws {FormatoInvalidoError} Se o valor não for um `boolean`.
     */
    constructor(campo: string, valor: any) {
        super(campo)

        this.validarBoolean(valor)

        this.valor = valor
    }
}
