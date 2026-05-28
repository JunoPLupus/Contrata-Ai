import { Prestador } from './prestador.model';

export type StatusPedido = 'aberto' | 'andamento' | 'concluido' | 'avaliado';

export interface Pedido {
  id: string;
  codigo: string;
  categoria: string;
  titulo: string;
  descricao?: string;
  status: StatusPedido;
  qtdOrcamentos?: number;
  prestador?: Prestador;
  dataInicio?: Date;
  dataConclusao?: Date;
  nota?: number;
}
