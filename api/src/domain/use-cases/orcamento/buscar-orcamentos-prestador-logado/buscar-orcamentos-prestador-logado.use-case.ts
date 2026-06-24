import { Orcamento } from "../../../entities/orcamento/orcamento.entity";
import { IOrcamentoRepository } from "../../../repositories/orcamento.repository";

export class BuscarOrcamentosPrestadorLogadoUseCase {
    constructor(private readonly orcamentoRepository: IOrcamentoRepository) {}

    /**
     * Retorna todos os orçamentos do prestador autenticado.
     * @param idPrestador - ID do prestador extraído do token JWT.
     * @returns Lista de orçamentos do prestador. Retorna array vazio se nenhum for encontrado.
     */
    async execute(idPrestador: string): Promise<Orcamento[]> {
        return this.orcamentoRepository.buscarPorIdPrestador(idPrestador)
    }
}
