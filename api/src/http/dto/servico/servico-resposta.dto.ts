import { Servico } from "../../../domain/entities/servico/servico.entity";

export type ServicoRespostaDTO = Pick<Servico, 'id' | 'idCategoria' | 'descricao' | 'precoMin' | 'precoMax' | 'prazoMedioDias'>
