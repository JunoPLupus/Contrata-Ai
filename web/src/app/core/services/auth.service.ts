import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  login(email: string, senha: string): Observable<string> {
    return this.http.post<{ token: string }>(`${this.baseUrl}/login`, { email, senha }).pipe(
      map(response => response.token)
    );
  }

  cadastrar(dados: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/clientes-prestadores`, dados);
  }

  salvarToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  logout(): void {
    localStorage.clear();
  }
}
