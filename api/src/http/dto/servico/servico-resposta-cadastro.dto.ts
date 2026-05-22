import { Servico } from "../../../domain/entities/servico/servico.entity";

export type ServicoRespostaCadastroDTO = Pick< Servico, 'id' | 'idCategoria' | 'descricao' | 'precoMin' | 'precoMax' | 'prazoMedioDias' | 'ativo' >