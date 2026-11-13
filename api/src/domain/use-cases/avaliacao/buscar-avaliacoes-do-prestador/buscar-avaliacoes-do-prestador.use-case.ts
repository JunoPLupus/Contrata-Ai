import { Avaliacao } from "../../../entities/avaliacao/avaliacao.entity";
import { IAvaliacaoRepository } from "../../../repositories/avaliacao.repository";
import { Papel } from "../../../value-objects/shared/papel/papel.vo";

export type AvaliacoesDoPrestadorResultado = {
    avaliacoes: Avaliacao[]
    media: number
    total: number
}

export class BuscarAvaliacoesDoPrestadorUseCase {
    constructor(private readonly avaliacaoRepository: IAvaliacaoRepository) {}

    /**
     * Busca as avaliações **recebidas** por um prestador (escritas pelos clientes) com a média
     * e total calculados (RF08). As avaliações que o prestador escreveu sobre clientes não entram.
     * Rota pública — não requer autenticação.
     *
     * A média é arredondada para 1 casa decimal. Retorna `media: 0` e `total: 0`
     * quando não houver avaliações (evita divisão por zero).
     *
     * @param idPrestador - ID do prestador.
     * @returns Objeto com `avaliacoes`, `media` e `total`.
     */
    async execute(idPrestador: string): Promise<AvaliacoesDoPrestadorResultado> {
        const avaliacoes = await this.avaliacaoRepository.buscarPorIdPrestador(idPrestador, Papel.CLIENTE)

        const total = avaliacoes.length
        const media = total === 0
            ? 0
            : Math.round((avaliacoes.reduce((soma, a) => soma + a.nota, 0) / total) * 10) / 10

        return { avaliacoes, media, total }
    }
}
