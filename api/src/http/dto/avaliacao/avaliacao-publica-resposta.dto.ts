import { AvaliacaoRespostaDTO } from "./avaliacao-resposta.dto";

/**
 * DTO de visão pública de uma avaliação.
 * Quando `anonima === true`, o id do **autor** é omitido (RN08): `idCliente` se o autor for
 * o cliente, `idPrestador` se o autor for o prestador. O id do avaliado continua visível.
 */
export type AvaliacaoPublicaRespostaDTO = Omit<AvaliacaoRespostaDTO, 'idCliente' | 'idPrestador'> & {
    idCliente?: string
    idPrestador?: string
}
