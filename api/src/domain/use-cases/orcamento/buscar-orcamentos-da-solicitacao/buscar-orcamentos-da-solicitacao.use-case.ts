import { Orcamento } from "../../../entities/orcamento/orcamento.entity";
import { IOrcamentoRepository } from "../../../repositories/orcamento.repository";
import { ISolicitacaoRepository } from "../../../repositories/solicitacao.repository";
import { RecursoNaoEncontradoError } from "../../../errors/recurso-nao-encontrado.error";
import { AcessoProibidoError } from "../../../errors/acesso-proibido.error";
import { StatusOrcamento } from "../../../value-objects/orcamento/status/status.vo";

export class BuscarOrcamentosDaSolicitacaoUseCase {
    constructor(
        private readonly orcamentoRepository: IOrcamentoRepository,
        private readonly solicitacaoRepository: ISolicitacaoRepository
    ) {}

    /**
     * Retorna os orçamentos com status `pendente` ou `aceito` de uma solicitação.
     * Acesso restrito ao cliente dono da solicitação.
     * @param idSolicitacao - ID da solicitação cujos orçamentos serão listados.
     * @param idCliente - ID do cliente logado, extraído do token JWT.
     * @returns Lista de orçamentos com status `pendente` da solicitação.
     * @throws {RecursoNaoEncontradoError} Se a solicitação não existir.
     * @throws {AcessoProibidoError} Se o cliente logado não for o dono da solicitação.
     */
    async execute(idSolicitacao: string, idCliente: string | undefined): Promise<Orcamento[]> {
        const solicitacao = await this.solicitacaoRepository.buscarPorId(idSolicitacao)
        if (!solicitacao) throw new RecursoNaoEncontradoError('Solicitação')

        if (solicitacao.idCliente !== idCliente) throw new AcessoProibidoError()

        const orcamentos = await this.orcamentoRepository.buscarPorIdSolicitacao(idSolicitacao)
        return orcamentos.filter(o => o.status === StatusOrcamento.PENDENTE || o.status === StatusOrcamento.ACEITO)
    }
}
