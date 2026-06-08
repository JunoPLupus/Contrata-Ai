// Service in-memory. Trocar por HTTP quando a API estiver pronta.
import { Injectable, signal } from '@angular/core';
import { Orcamento } from '../models/orcamento.model';

@Injectable({ providedIn: 'root' })
export class OrcamentosService {
  private readonly _orcamentos = signal<Orcamento[]>([]);

  get orcamentos() {
    return this._orcamentos.asReadonly();
  }

  criar(dados: { id_solicitacao: string; id_prestador: string; valor: number; prazo_dias?: number }): Orcamento {
    const novo: Orcamento = {
      _id: Date.now().toString(),
      id_solicitacao: dados.id_solicitacao,
      id_prestador: dados.id_prestador,
      valor: dados.valor,
      prazo_dias: dados.prazo_dias && dados.prazo_dias > 0 ? dados.prazo_dias : 15,
      status: 'pendente',
      data_resposta: new Date(),
    };
    this._orcamentos.update(lista => [...lista, novo]);
    return novo;
  }

  listar(): Orcamento[] {
    return this._orcamentos();
  }
}
