import { ValueObjectBase } from "../../value-object.base";
import { FormatoInvalidoError } from "../../../errors/formato-invalido.error";

export const TipoProblema = {
    SERVICO_NAO_REALIZADO: 'servico_nao_realizado',
    QUALIDADE_INSATISFATORIA: 'qualidade_insatisfatoria',
    ATRASO: 'atraso',
    COBRANCA_INDEVIDA: 'cobranca_indevida',
    COMPORTAMENTO_INADEQUADO: 'comportamento_inadequado',
    OUTRO: 'outro',
} as const

export type TipoProblemaTipo = typeof TipoProblema[keyof typeof TipoProblema]

const valoresValidos = Object.values(TipoProblema)

/**
 * Value Object dedicado para o campo `tipo` do problema embutido no Contrato.
 * Garante que apenas os valores do conjunto fechado sejam aceitos:
 * `'servico_nao_realizado'`, `'qualidade_insatisfatoria'`, `'atraso'`,
 * `'cobranca_indevida'`, `'comportamento_inadequado'` e `'outro'`.
 *
 * @throws {FormatoInvalidoError} Se o valor não pertencer ao conjunto permitido.
 */
export class TipoProblemaValueObject extends ValueObjectBase {
    readonly valor: TipoProblemaTipo

    /**
     * @param valor - Aceita `any` para capturar inputs inválidos de runtime e lançar
     *   erros de domínio em vez de `TypeError`.
     * @throws {FormatoInvalidoError} Se o valor não for um tipo de problema válido.
     */
    constructor(valor: any) {
        super('tipo')

        if (!valoresValidos.includes(valor)) {
            throw new FormatoInvalidoError('tipo')
        }

        this.valor = valor
    }
}
