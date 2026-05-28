export type StatusOrcamento = 'pendente' | 'aceito' | 'encerrado';

export interface Orcamento {
  _id: string;
  id_solicitacao: string;
  id_prestador: string;
  valor: number;
  prazo_dias: number;
  status: StatusOrcamento;
  data_resposta?: Date;
}
