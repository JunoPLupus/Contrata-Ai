import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-prestador-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './prestador-layout.component.html',
  styleUrl: './prestador-layout.component.scss',
})
export class PrestadorLayoutComponent {
  readonly nomePrestador = 'Carlos Souza';

  readonly menuItems = [
    { label: 'Painel',         icon: '🏠', rota: '/prestador/painel' },
    { label: 'Pedidos',        icon: '📋', rota: '/prestador/pedidos' },
    { label: 'Mensagens',      icon: '💬', rota: '/prestador/mensagens' },
    { label: 'Finanças',       icon: '💰', rota: '/prestador/financas' },
    { label: 'Configurações',  icon: '⚙️',  rota: '/prestador/configuracoes' },
  ];
}
