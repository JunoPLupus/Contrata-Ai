import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  login(email: string, senha: string): Observable<string> {
    return this.http.post(`${this.baseUrl}/login`, { email, senha }, { responseType: 'text' });
  }

  cadastrar(dados: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/clientes-prestadores`, dados);
  }

  salvarToken(token: string): void {
    localStorage.setItem('token', token.replace(/^"|"$/g, ''));
  }

  getToken(): string | null {
    const t = localStorage.getItem('token');
    return t ? t.replace(/^"|"$/g, '') : null;
  }

  getTipoUsuario(): 'prestador' | 'cliente' {
    const token = this.getToken();
    if (!token) return 'cliente';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.idPrestador ? 'prestador' : 'cliente';
    } catch {
      return 'cliente';
    }
  }

  getNomeUsuario(): string {
    const token = this.getToken();
    if (!token) return '';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.nome ?? payload.name ?? '';
    } catch {
      return '';
    }
  }

  logout(): void {
    localStorage.clear();
  }
}
