export type TipoSolicitacao = 'geral' | 'direto';
export type StatusSolicitacao = 'aberta' | 'encerrada' | 'cancelada';

export interface Solicitacao {
  id: string;
  idCliente: string;
  idCategoria: string;
  idPrestadorDireto?: string;
  tipo: TipoSolicitacao;
  descricao: string;
  status: StatusSolicitacao;
  dataSolicitacao: Date;
}
