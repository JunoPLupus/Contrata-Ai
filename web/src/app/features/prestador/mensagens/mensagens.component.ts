import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mensagens',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mensagens.component.html',
  styleUrl: './mensagens.component.scss',
})
export class MensagensComponent {
  constructor(private readonly router: Router) {}

  readonly conversas = [
    {
      inicial: 'R',
      nome: 'Ricardo Volt',
      ultimaMensagem: 'Chego em 15 min!',
      horario: '14:32',
      lida: false,
    },
    {
      inicial: 'M',
      nome: 'Maria Silva Pinturas',
      ultimaMensagem: 'Obrigada pela avaliação!',
      horario: '09:15',
      lida: true,
    },
    {
      inicial: 'C',
      nome: 'Carlos Andrade',
      ultimaMensagem: 'Podemos fechar o serviço?',
      horario: 'Ontem',
      lida: true,
    },
  ];

  voltar(): void {
    this.router.navigate(['/prestador/hub']);
  }
}
