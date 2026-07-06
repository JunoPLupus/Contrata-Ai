import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { Solicitacao } from '../../../core/models/solicitacao.model';
import { Orcamento } from '../../../core/models/orcamento.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-hub-prestador',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hub-prestador.component.html',
  styleUrl: './hub-prestador.component.scss',
})
export class HubPrestadorComponent implements OnInit {
  constructor(private readonly router: Router, private readonly http: HttpClient) {}

  solicitacoesGerais: Solicitacao[] = [];
  solicitacoesDiretas: Solicitacao[] = [];
  orcamentosEnviados: any[] = [];
  loading = signal(false);
  erro = signal('');

  readonly exemplosGerais: Solicitacao[] = [
    {
      id: 'exemplo-001',
      idCliente: 'demo',
      idCategoria: 'demo',
      tipo: 'geral',
      descricao: 'Instalação de ventilador de teto na sala',
      status: 'aberta',
      dataSolicitacao: new Date('2026-07-01'),
    },
    {
      id: 'exemplo-002',
      idCliente: 'demo',
      idCategoria: 'demo',
      tipo: 'geral',
      descricao: 'Pintura de muro externo de 15m',
      status: 'aberta',
      dataSolicitacao: new Date('2026-07-03'),
    },
    {
      id: 'exemplo-003',
      idCliente: 'demo',
      idCategoria: 'demo',
      tipo: 'geral',
      descricao: 'Conserto de vazamento na pia da cozinha',
      status: 'aberta',
      dataSolicitacao: new Date('2026-07-05'),
    },
  ];

  readonly exemplosDiretos: Solicitacao[] = [
    {
      id: 'exemplo-004',
      idCliente: 'demo',
      idCategoria: 'demo',
      tipo: 'direto',
      descricao: 'Montagem de guarda-roupa 6 portas',
      status: 'aberta',
      dataSolicitacao: new Date('2026-07-02'),
    },
    {
      id: 'exemplo-005',
      idCliente: 'demo',
      idCategoria: 'demo',
      tipo: 'direto',
      descricao: 'Manutenção de ar-condicionado split',
      status: 'aberta',
      dataSolicitacao: new Date('2026-07-04'),
    },
    {
      id: 'exemplo-006',
      idCliente: 'demo',
      idCategoria: 'demo',
      tipo: 'direto',
      descricao: 'Troca de fechadura da porta principal',
      status: 'aberta',
      dataSolicitacao: new Date('2026-07-06'),
    },
  ];

  private getHeaders(): HttpHeaders {
    const raw = localStorage.getItem('token') ?? '';
    const token = raw.replace(/^"|"$/g, '');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    this.erro.set('');
    this.loading.set(true);
    const headers = this.getHeaders();
    const api = environment.apiUrl;

    forkJoin({
      gerais: this.http.get<Solicitacao[]>(`${api}/solicitacoes/disponiveis`, { headers }),
      diretas: this.http.get<Solicitacao[]>(`${api}/solicitacoes?tipo=direto`, { headers }),
      orcamentos: this.http.get<any[]>(`${api}/orcamentos`, { headers }),
    }).subscribe({
      next: ({ gerais, diretas, orcamentos }) => {
        this.solicitacoesGerais = gerais;
        this.solicitacoesDiretas = diretas.filter(s => s.tipo === 'direto');
        this.orcamentosEnviados = orcamentos;
        this.loading.set(false);
      },
      error: () => {
        this.erro.set('Erro ao carregar dados. Tente novamente.');
        this.loading.set(false);
      },
    });
  }

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
