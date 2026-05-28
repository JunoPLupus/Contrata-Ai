import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header-logado',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header-logado.component.html',
  styleUrl: './header-logado.component.scss',
})
export class HeaderLogadoComponent {
  readonly nomeUsuario = 'Maria';
}
