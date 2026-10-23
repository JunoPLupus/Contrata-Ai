import { Orcamento } from "../../entities/orcamento/orcamento.entity";

/** `descricao: null` remove a descrição; ausente mantém o valor atual. */
export type OrcamentoAtualizacaoDTO = Partial<Pick<Orcamento, 'valor' | 'prazoEstimadoHoras' | 'status'>> & {
    descricao?: string | null
}
