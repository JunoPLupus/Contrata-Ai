import { Servico } from "../../entities/servico/servico.entity";

export type ServicoCadastroDTO = Pick< Servico, 'idPrestador' | 'idCategoria' | 'titulo' | 'descricao' | 'precoMin' | 'precoMax' | 'prazoMedioHoras' > & Partial<Pick<Servico, 'atendimentoDomiciliar'>>