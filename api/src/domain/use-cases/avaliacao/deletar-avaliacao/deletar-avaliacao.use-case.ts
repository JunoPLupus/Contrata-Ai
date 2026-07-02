import { IAvaliacaoRepository } from "../../../repositories/avaliacao.repository";
import { RecursoNaoEncontradoError } from "../../../errors/recurso-nao-encontrado.error";
import { AcessoProibidoError } from "../../../errors/acesso-proibido.error";
import { OperacaoNaoPermitidaError } from "../../../errors/operacao-nao-permitida.error";

export class DeletarAvaliacaoUseCase {
    constructor(private readonly avaliacaoRepository: IAvaliacaoRepository) {}

    /**
     * Remove permanentemente uma avaliação (hard delete).
     *
     * Regras:
     * - A avaliação deve existir.
     * - Só o autor (idCliente) pode deletar.
     * - A exclusão só é permitida até 7 dias após a criação.
     *
     * @param id - ID da avaliação.
     * @param idCliente - ID do cliente autenticado (do token).
     * @throws {RecursoNaoEncontradoError} Se a avaliação não existir.
     * @throws {AcessoProibidoError} Se o cliente não for o autor.
     * @throws {OperacaoNaoPermitidaError} Se a janela de 7 dias já tiver expirado.
     */
    async execute(id: string, idCliente: string): Promise<void> {
        const avaliacao = await this.avaliacaoRepository.buscarPorId(id)
        if (!avaliacao) throw new RecursoNaoEncontradoError('Avaliação')

        if (avaliacao.idCliente !== idCliente) throw new AcessoProibidoError()

        if (!avaliacao.podeSerAlterada()) {
            throw new OperacaoNaoPermitidaError('A avaliação só pode ser alterada até 7 dias após o registro.')
        }

        await this.avaliacaoRepository.deletar(id)
    }
}
