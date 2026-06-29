import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Categoria } from '../../../core/models/categoria.model';
import { Avaliacao } from '../../../core/models/avaliacao.model';
import { environment } from '../../../../environments/environment';

type AvaliacaoDisplay = Avaliacao & { nome_cliente?: string };

@Component({
  selector: 'app-perfil-prestador',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './perfil-prestador.component.html',
  styleUrl: './perfil-prestador.component.scss',
})
export class PerfilPrestadorComponent implements OnInit {
  constructor(private readonly http: HttpClient) {}

  prestador: any = null;
  usuario: any = null;
  categorias: Categoria[] = [];
  avaliacoes: AvaliacaoDisplay[] = [];
  loading = signal(false);
  erro = signal('');

  private getHeaders(): HttpHeaders {
    const raw = localStorage.getItem('token') ?? '';
    const token = raw.replace(/^"|"$/g, '');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  ngOnInit(): void {
    this.loading.set(true);
    const headers = this.getHeaders();
    const api = environment.apiUrl;

    this.http.get<any>(`${api}/prestadores`, { headers }).subscribe({
      next: (dados) => {
        this.prestador = dados;
        this.usuario = typeof dados.id_usuario === 'object' ? dados.id_usuario : { nome: '', email: '' };
        this.categorias = Array.isArray(dados.categorias) ? dados.categorias : [];

        const idPrestador = dados._id || dados.id;
        this.http
          .get<AvaliacaoDisplay[]>(`${api}/prestadores/${idPrestador}/avaliacoes`, { headers })
          .subscribe({
            next: (avs) => {
              this.avaliacoes = avs;
              this.loading.set(false);
            },
            error: () => {
              this.erro.set('Erro ao carregar avaliações.');
              this.loading.set(false);
            },
          });
      },
      error: () => {
        this.erro.set('Erro ao carregar perfil. Tente novamente.');
        this.loading.set(false);
      },
    });
  }

  get notaMedia(): number {
    if (!this.avaliacoes.length) return 0;
    const soma = this.avaliacoes.reduce((acc, av) => acc + av.nota, 0);
    return soma / this.avaliacoes.length;
  }

  get iniciais(): string {
    const nome: string = this.usuario?.nome ?? '';
    return nome
      .split(' ')
      .slice(0, 2)
      .map((n: string) => n[0])
      .join('')
      .toUpperCase();
  }

  starsArray(nota: number): { filled: boolean }[] {
    const rounded = Math.round(nota);
    return Array.from({ length: 5 }, (_, i) => ({ filled: i < rounded }));
  }

  autorDisplay(av: AvaliacaoDisplay): string {
    return av.anonima ? 'Anônimo' : (av.nome_cliente ?? 'Cliente');
  }
}
