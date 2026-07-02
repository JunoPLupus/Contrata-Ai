import { Servico } from "../../entities/servico/servico.entity";

export type ServicoAtualizacaoDTO = Partial<Pick<Servico, 'idCategoria' | 'descricao' | 'precoMin' | 'precoMax' | 'prazoMedioDias'>>
