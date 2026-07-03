import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header-logado',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header-logado.component.html',
  styleUrl: './header-logado.component.scss',
})
export class HeaderLogadoComponent {
  private readonly authService = inject(AuthService);

  get nomeUsuario(): string {
    return this.authService.getNomeUsuario();
  }
}
