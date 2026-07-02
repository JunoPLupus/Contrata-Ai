import { AvaliacaoPublicaRespostaDTO } from "./avaliacao-publica-resposta.dto";

export type AvaliacoesDoPrestadorRespostaDTO = {
    avaliacoes: AvaliacaoPublicaRespostaDTO[]
    media: number
    total: number
}
