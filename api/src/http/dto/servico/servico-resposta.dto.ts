import { Servico } from "../../../domain/entities/servico/servico.entity";

export type ServicoRespostaDTO = Pick<Servico, 'id' | 'idCategoria' | 'titulo' | 'descricao' | 'precoMin' | 'precoMax' | 'prazoMedioHoras' | 'atendimentoDomiciliar' | 'ativo'>
