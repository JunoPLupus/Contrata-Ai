import { NumberValueObject } from "../number/number.vo";
import { FormatoInvalidoError } from "../../../errors/formato-invalido.error";

/**
 * Value Object genérico para campos `number` que só aceitam inteiros
 * (ex: `prazoMedioHoras`). Mantém as regras de limite do `NumberValueObject`
 * e acrescenta a recusa de valores fracionados.
 */
export class IntegerValueObject extends NumberValueObject {
    /**
     * @param campo - Nome do campo, usado nas mensagens de erro de domínio.
     * @param valor - Aceita `any` para capturar inputs inválidos de runtime.
     * @param limiteMinimo - Valor mínimo aceito (opcional).
     * @param limiteMaximo - Valor máximo aceito (opcional).
     * @throws {FormatoInvalidoError} Se o valor não for um `number` inteiro.
     * @throws {ValorLimiteError} Se o valor estiver fora dos limites informados.
     */
    constructor(campo: string, valor: any, limiteMinimo?: number, limiteMaximo?: number) {
        super(campo, valor, limiteMinimo, limiteMaximo)

        if (!Number.isInteger(valor)) throw new FormatoInvalidoError(campo)
    }
}
