export type TipoSolicitacao = 'geral' | 'direto';
export type StatusSolicitacao = 'aberta' | 'encerrada' | 'cancelada';

export interface Solicitacao {
  _id: string;
  id_cliente: string;
  id_categoria: string;
  id_prestador_direto?: string;
  tipo: TipoSolicitacao;
  descricao: string;
  status: StatusSolicitacao;
  data_solicitacao: Date;
}
