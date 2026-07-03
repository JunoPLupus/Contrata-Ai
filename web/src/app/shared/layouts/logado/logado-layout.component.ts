import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { HeaderLogadoComponent } from '../../components/header-logado/header-logado.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-logado-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, HeaderLogadoComponent],
  templateUrl: './logado-layout.component.html',
  styleUrl: './logado-layout.component.scss',
})
export class LogadoLayoutComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
