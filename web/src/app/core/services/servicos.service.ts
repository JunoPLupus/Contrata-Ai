import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CriarServico {
  nome: string;
  idCategoria: string;
  descricao: string;
  preco: number;
}

@Injectable({ providedIn: 'root' })
export class ServicosService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  cadastrar(dados: CriarServico): Observable<unknown> {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    return this.http.post(`${this.baseUrl}/servicos`, dados, { headers });
  }
}
