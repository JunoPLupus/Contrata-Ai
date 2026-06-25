// Service in-memory. Trocar por HTTP quando a API estiver pronta.
import { Injectable, signal } from '@angular/core';
import { Solicitacao, TipoSolicitacao } from '../models/solicitacao.model';

@Injectable({ providedIn: 'root' })
export class SolicitacoesService {
  private readonly _solicitacoes = signal<Solicitacao[]>([]);

  get solicitacoes() {
    return this._solicitacoes.asReadonly();
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
