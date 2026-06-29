export type StatusContrato =
  | 'aguardando_inicio'
  | 'em_andamento'
  | 'aguardando_confirmacao'
  | 'concluido'
  | 'cancelado';

export interface Contrato {
  _id: string;
  id_solicitacao: string;
  id_orcamento: string;
  id_cliente: string;
  id_prestador: string;
  status: StatusContrato;
  data_aceite?: Date;
  data_inicio_estimada?: Date;
  prazo_estimado?: Date;
  data_conclusao?: Date;
  ciencia_pagamento?: boolean;
  whatsapp_liberado?: boolean;
}
