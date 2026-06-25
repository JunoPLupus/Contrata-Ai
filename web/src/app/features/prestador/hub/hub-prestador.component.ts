import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Solicitacao } from '../../../core/models/solicitacao.model';
import { Orcamento } from '../../../core/models/orcamento.model';

@Component({
  selector: 'app-hub-prestador',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hub-prestador.component.html',
  styleUrl: './hub-prestador.component.scss',
})
export class HubPrestadorComponent {
  constructor(private readonly router: Router) {}

  readonly solicitacoesGerais: Solicitacao[] = [
    {
      _id: 'sol-001',
      id_cliente: 'cli-001',
      id_categoria: 'cat-climatizacao',
      tipo: 'geral',
      descricao: 'Instalação de ar-condicionado split 12.000 BTUs no quarto principal. Parede de alvenaria, tomada 220V disponível.',
      status: 'aberta',
      data_solicitacao: new Date('2026-06-20T09:00:00'),
    },
    {
      _id: 'sol-002',
      id_cliente: 'cli-002',
      id_categoria: 'cat-pintura',
      tipo: 'geral',
      descricao: 'Pintura interna de apartamento 60m². Duas demãos com massa corrida e tinta acrílica. Quatro cômodos.',
      status: 'aberta',
      data_solicitacao: new Date('2026-06-21T14:30:00'),
    },
    {
      _id: 'sol-003',
      id_cliente: 'cli-003',
      id_categoria: 'cat-eletrica',
      tipo: 'geral',
      descricao: 'Troca de quadro de disjuntores e revisão geral da instalação elétrica em casa de 80m².',
      status: 'aberta',
      data_solicitacao: new Date('2026-06-22T11:00:00'),
    },
  ];

  readonly solicitacoesDiretas: Solicitacao[] = [
    {
      _id: 'sol-004',
      id_cliente: 'cli-004',
      id_categoria: 'cat-climatizacao',
      id_prestador_direto: 'prest-001',
      tipo: 'direto',
      descricao: 'Manutenção preventiva em dois aparelhos de ar-condicionado split. Limpeza, recarga de gás e verificação.',
      status: 'aberta',
      data_solicitacao: new Date('2026-06-23T08:00:00'),
    },
    {
      _id: 'sol-005',
      id_cliente: 'cli-005',
      id_categoria: 'cat-eletrica',
      id_prestador_direto: 'prest-001',
      tipo: 'direto',
      descricao: 'Instalação de tomadas externas e iluminação de jardim com timer automático.',
      status: 'aberta',
      data_solicitacao: new Date('2026-06-24T16:00:00'),
    },
  ];

  readonly orcamentosEnviados: (Orcamento & { descricaoServico: string })[] = [
    {
      _id: 'orc-001',
      id_solicitacao: 'sol-010',
      id_prestador: 'prest-001',
      valor: 350,
      prazo_dias: 2,
      status: 'aceito',
      data_resposta: new Date('2026-06-18T10:00:00'),
      descricaoServico: 'Instalação de ventilador de teto com controle remoto',
    },
    {
      _id: 'orc-002',
      id_solicitacao: 'sol-011',
      id_prestador: 'prest-001',
      valor: 1200,
      prazo_dias: 5,
      status: 'pendente',
      descricaoServico: 'Revisão completa do sistema elétrico residencial',
    },
    {
      _id: 'orc-003',
      id_solicitacao: 'sol-012',
      id_prestador: 'prest-001',
      valor: 800,
      prazo_dias: 3,
      status: 'encerrado',
      data_resposta: new Date('2026-06-15T09:00:00'),
      descricaoServico: 'Instalação de chuveiro elétrico e adaptação de tomada 220V',
    },
  ];

  navegarParaGerarOrcamento(idSolicitacao: string): void {
    this.router.navigate(['/prestador/gerar-orcamento'], {
      queryParams: { idSolicitacao },
    });
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      pendente: 'Pendente',
      aceito: 'Aceito',
      encerrado: 'Recusado',
    };
    return map[status] ?? status;
  }
}
