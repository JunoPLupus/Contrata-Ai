import { Pedido } from '../../../../core/models/pedido.model';

export const PEDIDOS_MOCK: Pedido[] = [
  {
    id: '1',
    codigo: '#SF-2540',
    categoria: 'MANUTENÇÃO',
    titulo: 'Reparo Hidráulico Residencial',
    descricao: 'Vazamento persistente sob a pia da cozinha.',
    status: 'aberto',
    qtdOrcamentos: 3,
  },
  {
    id: '2',
    codigo: '#SF-1185',
    categoria: 'ELÉTRICA',
    titulo: 'Instalação de Painel Solar',
    status: 'andamento',
    prestador: { _id: 'p1', id_usuario: 'u1', nome: 'Ricardo Eletro Volt' },
    dataInicio: new Date('2025-10-12'),
  },
  {
    id: '3',
    codigo: '#SF-0982',
    categoria: 'PINTURA',
    titulo: 'Pintura Quarto Infantil',
    status: 'avaliado',
    dataConclusao: new Date('2025-10-05'),
    nota: 4.5,
  },
];
