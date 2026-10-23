import { Servico } from "../../entities/servico/servico.entity";

/** `descricao: null` remove a descrição; ausente mantém o valor atual. */
export type ServicoAtualizacaoDTO = Partial<Pick<Servico, 'idCategoria' | 'titulo' | 'precoMin' | 'precoMax' | 'prazoMedioHoras' | 'atendimentoDomiciliar'>> & {
    descricao?: string | null
}
