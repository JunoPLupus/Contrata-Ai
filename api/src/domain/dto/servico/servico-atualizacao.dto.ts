import { Servico } from "../../entities/servico/servico.entity";

export type ServicoAtualizacaoDTO = Partial<Pick<Servico, 'idCategoria' | 'titulo' | 'descricao' | 'precoMin' | 'precoMax' | 'prazoMedioHoras' | 'atendimentoDomiciliar'>>
