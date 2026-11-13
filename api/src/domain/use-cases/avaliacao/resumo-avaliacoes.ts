import { Avaliacao } from "../../entities/avaliacao/avaliacao.entity";

/** Lista de avaliações recebidas por um perfil, com média e total (RF08). */
export type ResumoAvaliacoes = {
    avaliacoes: Avaliacao[]
    media: number
    total: number
}

/**
 * Monta o resumo das avaliações recebidas por um perfil (prestador ou cliente).
 * A média é arredondada para 1 casa decimal. Retorna `media: 0` e `total: 0`
 * quando não houver avaliações (evita divisão por zero).
 */
export function resumirAvaliacoes(avaliacoes: Avaliacao[]): ResumoAvaliacoes {
    const total = avaliacoes.length
    const media = total === 0
        ? 0
        : Math.round((avaliacoes.reduce((soma, a) => soma + a.nota, 0) / total) * 10) / 10

    return { avaliacoes, media, total }
}
