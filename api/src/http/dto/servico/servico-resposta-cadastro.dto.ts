import { Servico } from "../../../domain/entities/servico/servico.entity";

export type ServicoRespostaCadastroDTO = Pick< Servico, 'id' | 'idCategoria' | 'titulo' | 'descricao' | 'precoMin' | 'precoMax' | 'prazoMedioHoras' >