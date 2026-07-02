import { Orcamento } from "../../entities/orcamento/orcamento.entity";

export type OrcamentoAtualizacaoDTO = Partial<Pick<Orcamento, 'valor' | 'prazoDias' | 'status'>>
