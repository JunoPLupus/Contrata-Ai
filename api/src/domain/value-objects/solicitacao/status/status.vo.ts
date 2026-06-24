import { ValueObjectBase } from "../../value-object.base";
import { FormatoInvalidoError } from "../../../errors/formato-invalido.error";

export const StatusSolicitacao = {
    ABERTA: 'aberta',
    ENCERRADA: 'encerrada',
    CANCELADA: 'cancelada',
} as const

export type StatusSolicitacaoTipo = typeof StatusSolicitacao[keyof typeof StatusSolicitacao]

const valoresValidos = Object.values(StatusSolicitacao)

/**
 * Value Object dedicado para o campo `status` da entidade Solicitacao.
 * Garante que apenas os valores do conjunto fechado sejam aceitos:
 * `'aberta'`, `'encerrada'` e `'cancelada'`.
 *
 * @throws {FormatoInvalidoError} Se o valor não pertencer ao conjunto permitido.
 */
export class StatusSolicitacaoValueObject extends ValueObjectBase {
    readonly valor: StatusSolicitacaoTipo

    /**
     * @param valor - Aceita `any` para capturar inputs inválidos de runtime e lançar
     *   erros de domínio em vez de `TypeError`.
     * @throws {FormatoInvalidoError} Se o valor não for um status válido de solicitação.
     */
    constructor(valor: any) {
        super('status')

        if (!valoresValidos.includes(valor)) {
            throw new FormatoInvalidoError('status')
        }

        this.valor = valor as StatusSolicitacaoTipo
    }
}
