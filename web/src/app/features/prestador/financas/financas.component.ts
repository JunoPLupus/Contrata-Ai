import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-financas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './financas.component.html',
  styleUrl: './financas.component.scss',
})
export class FinancasComponent {
  constructor(private readonly router: Router) {}

  readonly meses = [
    { label: 'Jan', valor: 850,  altura: 49 },
    { label: 'Fev', valor: 1200, altura: 69 },
    { label: 'Mar', valor: 950,  altura: 54 },
    { label: 'Abr', valor: 1480, altura: 85 },
    { label: 'Mai', valor: 1100, altura: 63 },
    { label: 'Jun', valor: 1750, altura: 100 },
  ];

  readonly resumo = [
    { titulo: 'Total recebido',    valor: 'R$ 7.330' },
    { titulo: 'Orçamentos aceitos', valor: '12' },
    { titulo: 'Ticket médio',      valor: 'R$ 610' },
  ];

  voltar(): void {
    this.router.navigate(['/prestador/hub']);
  }
}
