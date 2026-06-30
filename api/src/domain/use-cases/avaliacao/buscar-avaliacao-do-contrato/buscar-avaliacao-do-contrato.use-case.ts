import { Avaliacao } from "../../../entities/avaliacao/avaliacao.entity";
import { IAvaliacaoRepository } from "../../../repositories/avaliacao.repository";
import { RecursoNaoEncontradoError } from "../../../errors/recurso-nao-encontrado.error";

export class BuscarAvaliacaoDoContratoUseCase {
    constructor(private readonly avaliacaoRepository: IAvaliacaoRepository) {}

    /**
     * Busca a avaliação de um contrato específico (rota pública).
     *
     * @param idContrato - ID do contrato.
     * @returns A avaliação do contrato.
     * @throws {RecursoNaoEncontradoError} Se o contrato ainda não foi avaliado.
     */
    async execute(idContrato: string): Promise<Avaliacao> {
        const avaliacao = await this.avaliacaoRepository.buscarPorIdContrato(idContrato)
        if (!avaliacao) throw new RecursoNaoEncontradoError('Avaliação')

        return avaliacao
    }
}
