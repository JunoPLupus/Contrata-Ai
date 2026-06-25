import { AvaliacaoRespostaDTO } from "./avaliacao-resposta.dto";

/**
 * DTO de visão pública de uma avaliação.
 * Quando `anonima === true`, o campo `idCliente` é omitido (RN08).
 */
export type AvaliacaoPublicaRespostaDTO = Omit<AvaliacaoRespostaDTO, 'idCliente'> & {
    idCliente?: string
}
