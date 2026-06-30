import { Solicitacao } from "../../../domain/entities/solicitacao/solicitacao.entity";

export type SolicitacaoRespostaDTO = Pick<
    Solicitacao,
    'id' | 'idCliente' | 'idCategoria' | 'idPrestadorDireto' | 'descricao' | 'status' | 'dataSolicitacao'
>
