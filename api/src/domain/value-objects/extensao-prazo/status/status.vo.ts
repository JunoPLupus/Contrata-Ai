import { ValueObjectBase } from "../../value-object.base";
import { FormatoInvalidoError } from "../../../errors/formato-invalido.error";

export const StatusExtensaoPrazo = {
    PENDENTE: 'pendente',
    APROVADA: 'aprovada',
    RECUSADA: 'recusada',
} as const

export type StatusExtensaoPrazoTipo = typeof StatusExtensaoPrazo[keyof typeof StatusExtensaoPrazo]

const valoresValidos = Object.values(StatusExtensaoPrazo)

/**
 * Value Object dedicado para o campo `status` da entidade ExtensaoPrazo.
 * Garante que apenas os valores do conjunto fechado sejam aceitos:
 * `'pendente'`, `'aprovada'` e `'recusada'`.
 *
 * @throws {FormatoInvalidoError} Se o valor não pertencer ao conjunto permitido.
 */
export class StatusExtensaoPrazoValueObject extends ValueObjectBase {
    readonly valor: StatusExtensaoPrazoTipo

    /**
     * @param valor - Aceita `any` para capturar inputs inválidos de runtime e lançar
     *   erros de domínio em vez de `TypeError`.
     * @throws {FormatoInvalidoError} Se o valor não for um status válido de extensão de prazo.
     */
    constructor(valor: any) {
        super('status')

        if (!valoresValidos.includes(valor)) {
            throw new FormatoInvalidoError('status')
        }

        this.valor = valor as StatusExtensaoPrazoTipo
    }
}
