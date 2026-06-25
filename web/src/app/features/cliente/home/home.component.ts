import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { Pedido } from '../../../core/models/pedido.model';
import { PEDIDOS_MOCK } from './data/pedidos.mock';

@Component({
  selector: 'app-cliente-home',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  private readonly router = inject(Router);
  abaTopo: 'meus-pedidos' | 'historico' = 'meus-pedidos';
  abaStatus: 'aberto' | 'andamento' | 'concluido' = 'aberto';

  readonly pedidos: Pedido[] = PEDIDOS_MOCK;

  get pedidosFiltrados(): Pedido[] {
    if (this.abaStatus === 'concluido') {
      return PEDIDOS_MOCK.filter(p => p.status === 'concluido' || p.status === 'avaliado');
    }
    return PEDIDOS_MOCK.filter(p => p.status === this.abaStatus);
  }

  get contadores() {
    return {
      aberto: PEDIDOS_MOCK.filter(p => p.status === 'aberto').length,
      andamento: PEDIDOS_MOCK.filter(p => p.status === 'andamento').length,
      concluido: PEDIDOS_MOCK.filter(p => p.status === 'concluido' || p.status === 'avaliado').length,
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
