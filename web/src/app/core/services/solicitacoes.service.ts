import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Solicitacao, TipoSolicitacao } from '../models/solicitacao.model';
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

  getMinhasSolicitacoes(): Observable<Solicitacao[]> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.get<Solicitacao[]>(`${this.baseUrl}/solicitacoes`, { headers });
  }

  criar(dados: {
    id_cliente: string;
    id_categoria: string;
    tipo: TipoSolicitacao;
    descricao: string;
    id_prestador_direto?: string;
  }): Solicitacao {
    const nova: Solicitacao = {
      _id: Date.now().toString(),
      id_cliente: dados.id_cliente,
      id_categoria: dados.id_categoria,
      tipo: dados.tipo,
      descricao: dados.descricao,
      id_prestador_direto: dados.id_prestador_direto,
      status: 'aberta',
      data_solicitacao: new Date(),
    };
    this._solicitacoes.update(lista => [...lista, nova]);
    return nova;
  }
}
