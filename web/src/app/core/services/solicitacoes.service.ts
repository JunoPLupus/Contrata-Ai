import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Solicitacao, TipoSolicitacao } from '../models/solicitacao.model';
import { Categoria } from '../models/categoria.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SolicitacoesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  private readonly _solicitacoes = signal<Solicitacao[]>([]);

  get solicitacoes() {
    return this._solicitacoes.asReadonly();
  }

  getMinhasSolicitacoes(): Observable<Solicitacao[]> {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    return this.http.get<Solicitacao[]>(`${this.baseUrl}/solicitacoes`, { headers });
  }

  getCategorias(): Observable<Categoria[]> {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    return this.http.get<Categoria[]>(`${this.baseUrl}/categorias`, { headers });
  }

  buscarPrestadores(idCategoria: string): Observable<{ id: string; nome: string }[]> {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    return this.http.get<{ id: string; nome: string }[]>(
      `${this.baseUrl}/prestadores/buscar?idCategoria=${idCategoria}`,
      { headers }
    );
  }

  criar(dados: {
    idCategoria: string;
    tipo: TipoSolicitacao;
    descricao: string;
    idPrestadorDireto?: string;
  }): Observable<Solicitacao> {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    return this.http.post<Solicitacao>(`${this.baseUrl}/solicitacoes`, dados, { headers });
  }
}
