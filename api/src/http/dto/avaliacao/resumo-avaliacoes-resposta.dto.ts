import { AvaliacaoPublicaRespostaDTO } from "./avaliacao-publica-resposta.dto";

/** Avaliações recebidas por um perfil (prestador ou cliente), com média e total. */
export type ResumoAvaliacoesRespostaDTO = {
    avaliacoes: AvaliacaoPublicaRespostaDTO[]
    media: number
    total: number
}
