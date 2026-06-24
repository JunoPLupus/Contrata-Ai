import { Orcamento } from "../../../domain/entities/orcamento/orcamento.entity";

export type OrcamentoRespostaDTO = Pick<
    Orcamento,
    'id' | 'idSolicitacao' | 'idPrestador' | 'valor' | 'prazoDias' | 'status' | 'dataCriacao' | 'dataAceite'
>
