import { Orcamento } from "../../../domain/entities/orcamento/orcamento.entity";

export type OrcamentoRespostaDTO = Pick<
    Orcamento,
    'id' | 'idSolicitacao' | 'idPrestador' | 'valorEstimado' | 'descricao' | 'prazoEstimadoHoras' | 'status' | 'dataCriacao' | 'dataAceite'
>
