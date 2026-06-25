import { ValueObjectBase } from "../../value-object.base";
import { FormatoInvalidoError } from "../../../errors/formato-invalido.error";

export const StatusContrato = {
    AGUARDANDO_INICIO: 'aguardando_inicio',
    EM_ANDAMENTO: 'em_andamento',
    AGUARDANDO_CONFIRMACAO: 'aguardando_confirmacao',
    CONCLUIDO: 'concluido',
    CANCELADO: 'cancelado',
} as const

export type StatusContratoTipo = typeof StatusContrato[keyof typeof StatusContrato]

const valoresValidos = Object.values(StatusContrato)

/**
 * Value Object dedicado para o campo `status` da entidade Contrato.
 * Garante que apenas os valores do conjunto fechado sejam aceitos:
 * `'aguardando_inicio'`, `'em_andamento'`, `'aguardando_confirmacao'`,
 * `'concluido'` e `'cancelado'`.
 *
 * @throws {FormatoInvalidoError} Se o valor não pertencer ao conjunto permitido.
 */
export class StatusContratoValueObject extends ValueObjectBase {
    readonly valor: StatusContratoTipo

    /**
     * @param valor - Aceita `any` para capturar inputs inválidos de runtime e lançar
     *   erros de domínio em vez de `TypeError`.
     * @throws {FormatoInvalidoError} Se o valor não for um status válido de contrato.
     */
    constructor(valor: any) {
        super('status')

        if (!valoresValidos.includes(valor)) {
            throw new FormatoInvalidoError('status')
        }

        this.valor = valor
    }
}
