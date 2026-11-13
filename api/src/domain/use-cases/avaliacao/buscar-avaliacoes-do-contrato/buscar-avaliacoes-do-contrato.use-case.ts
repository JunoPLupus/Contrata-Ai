import { Avaliacao } from "../../../entities/avaliacao/avaliacao.entity";
import { IAvaliacaoRepository } from "../../../repositories/avaliacao.repository";

export class BuscarAvaliacoesDoContratoUseCase {
    constructor(private readonly avaliacaoRepository: IAvaliacaoRepository) {}

    /**
     * Busca as avaliações de um contrato (rota pública): até 2, uma por direção
     * (cliente → prestador e prestador → cliente). Cada item informa o `autor`.
     *
     * Contrato ainda não avaliado é um estado normal: retorna lista vazia, sem erro.
     * Não confere se o contrato existe (contrato inexistente também retorna lista vazia).
     *
     * @param idContrato - ID do contrato.
     * @returns Lista com 0, 1 ou 2 avaliações.
     */
    async execute(idContrato: string): Promise<Avaliacao[]> {
        return this.avaliacaoRepository.buscarPorIdContrato(idContrato)
    }
}
