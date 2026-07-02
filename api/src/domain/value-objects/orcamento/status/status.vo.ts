import { ValueObjectBase } from "../../value-object.base";
import { FormatoInvalidoError } from "../../../errors/formato-invalido.error";

export const StatusOrcamento = {
    PENDENTE: 'pendente',
    ACEITO: 'aceito',
    ENCERRADO: 'encerrado',
    CANCELADO: 'cancelado',
} as const

export type StatusOrcamentoTipo = typeof StatusOrcamento[keyof typeof StatusOrcamento]

const valoresValidos = Object.values(StatusOrcamento)

/**
 * Value Object dedicado para o campo `status` da entidade Orcamento.
 * Garante que apenas os valores do conjunto fechado sejam aceitos:
 * `'pendente'`, `'aceito'`, `'encerrado'` e `'cancelado'`.
 *
 * @throws {FormatoInvalidoError} Se o valor não pertencer ao conjunto permitido.
 */
export class StatusOrcamentoValueObject extends ValueObjectBase {
    readonly valor: StatusOrcamentoTipo

    /**
     * @param valor - Aceita `any` para capturar inputs inválidos de runtime e lançar
     *   erros de domínio em vez de `TypeError`.
     * @throws {FormatoInvalidoError} Se o valor não for um status válido de orçamento.
     */
    constructor(valor: any) {
        super('status')

        if (!valoresValidos.includes(valor)) {
            throw new FormatoInvalidoError('status')
        }

        this.valor = valor as StatusOrcamentoTipo
    }
}
