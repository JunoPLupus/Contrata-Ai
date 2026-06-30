import { Solicitacao } from "../../entities/solicitacao/solicitacao.entity";

export type SolicitacaoAtualizacaoDTO = Partial<Pick<Solicitacao, 'descricao' | 'status'>>
