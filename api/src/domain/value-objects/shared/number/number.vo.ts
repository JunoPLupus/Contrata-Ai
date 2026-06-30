import { ValueObjectBase } from "../../value-object.base";

/**
 * Value Object genérico para campos `number`.
 * Centraliza a validação de campos numéricos que não possuem regras
 * específicas além de limites de valor, evitando a criação de uma classe
 * dedicada para cada campo (ex: `precoMin`, `precoMax`, `prazoMedioDias`).
 */
export class NumberValueObject extends ValueObjectBase {
    readonly valor: number

    /**
     * @param campo - Nome do campo, usado nas mensagens de erro de domínio.
     * @param valor - Aceita `any` para capturar inputs inválidos de runtime
     * (ex: campos ausentes no body HTTP) e lançar erros de domínio
     * em vez de `TypeError`.
     * @param limiteMinimo - Valor mínimo aceito (opcional).
     * @param limiteMaximo - Valor máximo aceito (opcional).
     * @throws {FormatoInvalidoError} Se o valor não for um `number`.
     * @throws {ValorLimiteError} Se o valor estiver fora dos limites informados.
     */
    constructor(campo: string, valor: any, limiteMinimo?: number, limiteMaximo?: number) {
        super(campo, limiteMinimo, limiteMaximo)

        this.validarNumber(valor)

        this.valor = valor
    }
}
