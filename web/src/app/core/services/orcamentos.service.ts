import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OrcamentosService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  criar(dados: { id_solicitacao: string; valor: number; prazo_dias?: number }): Observable<unknown> {
    const raw = localStorage.getItem('token') ?? '';
    const token = raw.replace(/^"|"$/g, '');
    const headers = { Authorization: `Bearer ${token}` };
    return this.http.post<unknown>(`${this.baseUrl}/orcamentos`, dados, { headers });
  }
}
