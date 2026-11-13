import { Avaliacao } from "../../../entities/avaliacao/avaliacao.entity";
import { IAvaliacaoRepository } from "../../../repositories/avaliacao.repository";
import { Papel } from "../../../value-objects/shared/papel/papel.vo";

export class BuscarAvaliacoesDoClienteLogadoUseCase {
    constructor(private readonly avaliacaoRepository: IAvaliacaoRepository) {}

    /**
     * Busca todas as avaliações **feitas** pelo cliente autenticado (autor `'cliente'`).
     * As avaliações que ele recebeu de prestadores não entram.
     *
     * @param idCliente - ID do cliente do token.
     * @returns Lista de avaliações do cliente (pode ser vazia).
     */
    async execute(idCliente: string): Promise<Avaliacao[]> {
        return this.avaliacaoRepository.buscarPorIdCliente(idCliente, Papel.CLIENTE)
    }
}
