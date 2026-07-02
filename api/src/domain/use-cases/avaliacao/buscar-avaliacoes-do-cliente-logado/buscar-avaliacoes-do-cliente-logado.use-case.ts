import { Avaliacao } from "../../../entities/avaliacao/avaliacao.entity";
import { IAvaliacaoRepository } from "../../../repositories/avaliacao.repository";

export class BuscarAvaliacoesDoClienteLogadoUseCase {
    constructor(private readonly avaliacaoRepository: IAvaliacaoRepository) {}

    /**
     * Busca todas as avaliações feitas pelo cliente autenticado.
     *
     * @param idCliente - ID do cliente do token.
     * @returns Lista de avaliações do cliente (pode ser vazia).
     */
    async execute(idCliente: string): Promise<Avaliacao[]> {
        return this.avaliacaoRepository.buscarPorIdCliente(idCliente)
    }
}
