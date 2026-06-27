import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Solicitacao, TipoSolicitacao } from '../models/solicitacao.model';
import { Categoria } from '../models/categoria.model';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SolicitacoesService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly baseUrl = environment.apiUrl;

  private readonly _solicitacoes = signal<Solicitacao[]>([]);

  get solicitacoes() {
    return this._solicitacoes.asReadonly();
  }

  private get headers(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getMinhasSolicitacoes(): Observable<Solicitacao[]> {
    return this.http.get<Solicitacao[]>(`${this.baseUrl}/solicitacoes`, { headers: this.headers });
  }

  getCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.baseUrl}/categorias`, { headers: this.headers });
  }

  criar(dados: {
    id_categoria: string;
    tipo: TipoSolicitacao;
    descricao: string;
    id_prestador_direto?: string;
  }): Observable<Solicitacao> {
    return this.http.post<Solicitacao>(`${this.baseUrl}/solicitacoes`, dados, { headers: this.headers });
  }
}
