import { Solicitacao } from "../../entities/solicitacao/solicitacao.entity";

export type SolicitacaoCadastroDTO = Pick<Solicitacao, 'idCliente' | 'idCategoria' | 'descricao'> & {
    idPrestadorDireto?: string
}
