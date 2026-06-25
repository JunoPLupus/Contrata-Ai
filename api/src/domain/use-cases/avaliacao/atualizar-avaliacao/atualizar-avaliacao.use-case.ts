import { Avaliacao } from "../../../entities/avaliacao/avaliacao.entity";
import { IAvaliacaoRepository } from "../../../repositories/avaliacao.repository";
import { AvaliacaoAtualizacaoDTO } from "../../../dto/avaliacao/avaliacao-atualizacao.dto";
import { RecursoNaoEncontradoError } from "../../../errors/recurso-nao-encontrado.error";
import { AcessoProibidoError } from "../../../errors/acesso-proibido.error";
import { OperacaoNaoPermitidaError } from "../../../errors/operacao-nao-permitida.error";

export class AtualizarAvaliacaoUseCase {
    constructor(private readonly avaliacaoRepository: IAvaliacaoRepository) {}

    /**
     * Atualiza campos permitidos de uma avaliação (nota, comentario, anonima).
     *
     * Regras:
     * - A avaliação deve existir.
     * - Só o autor (idCliente) pode atualizar.
     * - A atualização só é permitida até 7 dias após a criação.
     *
     * @param id - ID da avaliação.
     * @param idCliente - ID do cliente autenticado (do token).
     * @param dados - Campos a atualizar.
     * @returns A avaliação atualizada.
     * @throws {RecursoNaoEncontradoError} Se a avaliação não existir.
     * @throws {AcessoProibidoError} Se o cliente não for o autor.
     * @throws {OperacaoNaoPermitidaError} Se a janela de 7 dias já tiver expirado.
     */
    async execute(id: string, idCliente: string, dados: AvaliacaoAtualizacaoDTO): Promise<Avaliacao> {
        const avaliacao = await this.avaliacaoRepository.buscarPorId(id)
        if (!avaliacao) throw new RecursoNaoEncontradoError('Avaliação')

        if (avaliacao.idCliente !== idCliente) throw new AcessoProibidoError()

        if (!avaliacao.podeSerAlterada()) {
            throw new OperacaoNaoPermitidaError('A avaliação só pode ser alterada até 7 dias após o registro.')
        }

        avaliacao.atualizar(dados)

        return this.avaliacaoRepository.atualizar(avaliacao)
    }
}
