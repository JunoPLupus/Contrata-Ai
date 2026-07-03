import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-prestador-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './prestador-layout.component.html',
  styleUrl: './prestador-layout.component.scss',
})
export class PrestadorLayoutComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly nomePrestador = 'Carlos Souza';

  readonly menuItems = [
    { label: 'Painel',         icon: '🏠', rota: '/prestador/painel' },
    { label: 'Pedidos',        icon: '📋', rota: '/prestador/pedidos' },
    { label: 'Mensagens',      icon: '💬', rota: '/prestador/mensagens' },
    { label: 'Finanças',       icon: '💰', rota: '/prestador/financas' },
    { label: 'Configurações',  icon: '⚙️',  rota: '/prestador/configuracoes' },
  ];

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
