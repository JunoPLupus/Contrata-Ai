import { Orcamento } from "../../entities/orcamento/orcamento.entity";

export type OrcamentoCadastroDTO = Pick<Orcamento, 'idSolicitacao' | 'idPrestador' | 'valor' | 'descricao' | 'prazoEstimadoHoras'> & {
    /** Perfil de cliente do próprio usuário logado como prestador; só barra orçamento na própria solicitação. */
    idClienteLogado?: string
}
