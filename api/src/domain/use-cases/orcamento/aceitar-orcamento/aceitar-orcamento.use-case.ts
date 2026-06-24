import { Orcamento } from "../../../entities/orcamento/orcamento.entity";
import { IOrcamentoRepository } from "../../../repositories/orcamento.repository";
import { ISolicitacaoRepository } from "../../../repositories/solicitacao.repository";
import { AtualizarSolicitacaoUseCase } from "../../solicitacao/atualizar-solicitacao/atualizar-solicitacao.use-case";
import { RecursoNaoEncontradoError } from "../../../errors/recurso-nao-encontrado.error";
import { AcessoProibidoError } from "../../../errors/acesso-proibido.error";
import { OperacaoNaoPermitidaError } from "../../../errors/operacao-nao-permitida.error";
import { StatusOrcamento } from "../../../value-objects/orcamento/status/status.vo";
import { StatusSolicitacao } from "../../../value-objects/solicitacao/status/status.vo";

export class AceitarOrcamentoUseCase {
    constructor(
        private readonly orcamentoRepository: IOrcamentoRepository,
        private readonly solicitacaoRepository: ISolicitacaoRepository,
        private readonly atualizarSolicitacaoUseCase: AtualizarSolicitacaoUseCase
    ) {}

    /**
     * Aceita um orçamento pendente, disparando a cascata:
     * 1. O orçamento aceito → `aceito` + `dataAceite` preenchida.
     * 2. Todos os demais orçamentos `pendente` da solicitação → `encerrado`.
     * 3. A solicitação → `encerrada` (via `AtualizarSolicitacaoUseCase`).
     *
     * @remarks Os passos 1–3 não são atômicos (sem transação Mongo).
     *   Em caso de falha parcial, pode haver inconsistência — candidato a melhoria
     *   futura com sessão/transação Mongo (ver ADR-013).
     *
     * @param idOrcamento - ID do orçamento a ser aceito.
     * @param idCliente - ID do cliente autenticado extraído do token JWT.
     * @returns O orçamento aceito.
     * @throws {RecursoNaoEncontradoError} Se o orçamento não existir.
     * @throws {RecursoNaoEncontradoError} Se a solicitação vinculada não existir.
     * @throws {AcessoProibidoError} Se o cliente não for o dono da solicitação.
     * @throws {OperacaoNaoPermitidaError} Se o orçamento não estiver com status `'pendente'`.
     */
    async execute(idOrcamento: string, idCliente: string): Promise<Orcamento> {
        const orcamento = await this.orcamentoRepository.buscarPorId(idOrcamento)
        if (!orcamento) throw new RecursoNaoEncontradoError('Orçamento')

        const solicitacao = await this.solicitacaoRepository.buscarPorId(orcamento.idSolicitacao)
        if (!solicitacao) throw new RecursoNaoEncontradoError('Solicitação')

        if (solicitacao.idCliente !== idCliente) throw new AcessoProibidoError()

        if (orcamento.status !== StatusOrcamento.PENDENTE) {
            throw new OperacaoNaoPermitidaError(
                "Só é possível aceitar um orçamento com status 'pendente'."
            )
        }

        orcamento.marcarComoAceito()
        const orcamentoAceito = await this.orcamentoRepository.atualizar(orcamento)

        const outrosOrcamentos = await this.orcamentoRepository.buscarPorIdSolicitacao(orcamento.idSolicitacao)
        for (const outro of outrosOrcamentos) {
            if (outro.id !== orcamento.id && outro.status === StatusOrcamento.PENDENTE) {
                outro.status = StatusOrcamento.ENCERRADO
                await this.orcamentoRepository.atualizar(outro)
            }
        }

        await this.atualizarSolicitacaoUseCase.execute(
            orcamento.idSolicitacao,
            idCliente,
            { status: StatusSolicitacao.ENCERRADA }
        )

        return orcamentoAceito
    }
}
