import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { Pedido, StatusPedido } from '../../../core/models/pedido.model';
import { Solicitacao } from '../../../core/models/solicitacao.model';
import { SolicitacoesService } from '../../../core/services/solicitacoes.service';

@Component({
  selector: 'app-cliente-home',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly solicitacoesService = inject(SolicitacoesService);

  abaTopo: 'meus-pedidos' | 'historico' = 'meus-pedidos';
  abaStatus: 'aberto' | 'andamento' | 'concluido' = 'aberto';

  readonly loading = signal(false);
  readonly erro = signal('');
  private readonly pedidos = signal<Pedido[]>([]);

  ngOnInit(): void {
    this.loading.set(true);
    this.solicitacoesService.getMinhasSolicitacoes().subscribe({
      next: (solicitacoes) => {
        this.pedidos.set(solicitacoes.map(s => this.mapear(s)));
        this.loading.set(false);
      },
      error: () => {
        this.erro.set('Não foi possível carregar suas solicitações.');
        this.loading.set(false);
      },
    });
  }

  private mapear(s: Solicitacao): Pedido {
    const statusMap: Record<string, StatusPedido> = {
      aberta: 'aberto',
      encerrada: 'concluido',
      cancelada: 'concluido',
    };
    return {
      id: s._id,
      codigo: `#${s._id.slice(-6).toUpperCase()}`,
      categoria: s.id_categoria,
      titulo: s.descricao.length > 60 ? s.descricao.slice(0, 57) + '…' : s.descricao,
      descricao: s.descricao,
      status: statusMap[s.status] ?? 'aberto',
      dataInicio: s.data_solicitacao ? new Date(s.data_solicitacao) : undefined,
    };
  }

  get pedidosFiltrados(): Pedido[] {
    const lista = this.pedidos();
    if (this.abaStatus === 'concluido') {
      return lista.filter(p => p.status === 'concluido' || p.status === 'avaliado');
    }
    return lista.filter(p => p.status === this.abaStatus);
  }

  get contadores() {
    const lista = this.pedidos();
    return {
      aberto: lista.filter(p => p.status === 'aberto').length,
      andamento: lista.filter(p => p.status === 'andamento').length,
      concluido: lista.filter(p => p.status === 'concluido' || p.status === 'avaliado').length,
    };
  }

  get vazio(): boolean {
    return this.pedidosFiltrados.length === 0;
  }

  selecionarAbaTopo(aba: 'meus-pedidos' | 'historico'): void {
    this.abaTopo = aba;
  }

  selecionarAbaStatus(status: 'aberto' | 'andamento' | 'concluido'): void {
    this.abaStatus = status;
  }

  novoOrcamento(): void {
    this.router.navigate(['/cliente/solicitar-orcamento']);
  }

  getStars(nota: number): number[] {
    return [1, 2, 3, 4, 5];
  }
}
