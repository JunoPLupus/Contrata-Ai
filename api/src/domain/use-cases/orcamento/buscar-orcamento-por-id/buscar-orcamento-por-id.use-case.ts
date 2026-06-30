import { Orcamento } from "../../../entities/orcamento/orcamento.entity";
import { IOrcamentoRepository } from "../../../repositories/orcamento.repository";
import { ISolicitacaoRepository } from "../../../repositories/solicitacao.repository";
import { RecursoNaoEncontradoError } from "../../../errors/recurso-nao-encontrado.error";
import { AcessoProibidoError } from "../../../errors/acesso-proibido.error";

export class BuscarOrcamentoPorIdUseCase {
    constructor(
        private readonly orcamentoRepository: IOrcamentoRepository,
        private readonly solicitacaoRepository: ISolicitacaoRepository
    ) {}

    /**
     * Busca um orçamento pelo ID, aplicando regras de permissão por ator.
     * - Prestador dono do orçamento: pode ver.
     * - Cliente dono da solicitação vinculada: pode ver.
     * @param id - ID do orçamento.
     * @param idCliente - ID do cliente autenticado (do JWT).
     * @param idPrestador - ID do prestador autenticado (do JWT), se o ator for prestador.
     * @returns O orçamento encontrado.
     * @throws {RecursoNaoEncontradoError} Se o orçamento não existir.
     * @throws {AcessoProibidoError} Se o ator não tiver permissão para ver o orçamento.
     */
    async execute(id: string, idCliente: string, idPrestador?: string): Promise<Orcamento> {
        const orcamento = await this.orcamentoRepository.buscarPorId(id)
        if (!orcamento) throw new RecursoNaoEncontradoError('Orçamento')

        if (idPrestador !== undefined && orcamento.idPrestador === idPrestador) {
            return orcamento
        }

        const solicitacao = await this.solicitacaoRepository.buscarPorId(orcamento.idSolicitacao)
        if (solicitacao && solicitacao.idCliente === idCliente) {
            return orcamento
        }

        throw new AcessoProibidoError()
    }
}
