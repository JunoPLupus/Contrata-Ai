import { Avaliacao } from "../../../entities/avaliacao/avaliacao.entity";
import { IAvaliacaoRepository } from "../../../repositories/avaliacao.repository";
import { RecursoNaoEncontradoError } from "../../../errors/recurso-nao-encontrado.error";

export class BuscarAvaliacaoPorIdUseCase {
    constructor(private readonly avaliacaoRepository: IAvaliacaoRepository) {}

    /**
     * Busca uma avaliação pelo ID (rota pública).
     *
     * @param id - ID da avaliação.
     * @returns A avaliação encontrada.
     * @throws {RecursoNaoEncontradoError} Se a avaliação não existir.
     */
    async execute(id: string): Promise<Avaliacao> {
        const avaliacao = await this.avaliacaoRepository.buscarPorId(id)
        if (!avaliacao) throw new RecursoNaoEncontradoError('Avaliação')

        return avaliacao
    }
}
