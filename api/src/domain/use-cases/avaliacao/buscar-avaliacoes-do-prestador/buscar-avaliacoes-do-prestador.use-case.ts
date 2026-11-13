import { IAvaliacaoRepository } from "../../../repositories/avaliacao.repository";
import { Papel } from "../../../value-objects/shared/papel/papel.vo";
import { ResumoAvaliacoes, resumirAvaliacoes } from "../resumo-avaliacoes";

export class BuscarAvaliacoesDoPrestadorUseCase {
    constructor(private readonly avaliacaoRepository: IAvaliacaoRepository) {}

    /**
     * Busca as avaliações **recebidas** por um prestador (escritas pelos clientes) com a média
     * e total calculados (RF08). As avaliações que o prestador escreveu sobre clientes não entram.
     * Rota pública — não requer autenticação.
     *
     * @param idPrestador - ID do prestador.
     * @returns Objeto com `avaliacoes`, `media` e `total`.
     */
    async execute(idPrestador: string): Promise<ResumoAvaliacoes> {
        const avaliacoes = await this.avaliacaoRepository.buscarPorIdPrestador(idPrestador, Papel.CLIENTE)

        return resumirAvaliacoes(avaliacoes)
    }
}
