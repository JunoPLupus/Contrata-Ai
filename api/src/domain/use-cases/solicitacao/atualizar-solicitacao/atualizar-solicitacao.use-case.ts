import { Solicitacao } from "../../../entities/solicitacao/solicitacao.entity";
import { ISolicitacaoRepository } from "../../../repositories/solicitacao.repository";
import { SolicitacaoAtualizacaoDTO } from "../../../dto/solicitacao/solicitacao-atualizacao.dto";
import { RecursoNaoEncontradoError } from "../../../errors/recurso-nao-encontrado.error";
import { AcessoProibidoError } from "../../../errors/acesso-proibido.error";
import { OperacaoNaoPermitidaError } from "../../../errors/operacao-nao-permitida.error";
import { StatusSolicitacao } from "../../../value-objects/solicitacao/status/status.vo";

const transicoesPermitidas: Record<string, string[]> = {
    [StatusSolicitacao.ABERTA]: [StatusSolicitacao.CANCELADA, StatusSolicitacao.ENCERRADA],
    [StatusSolicitacao.CANCELADA]: [],
    [StatusSolicitacao.ENCERRADA]: [],
}

export class AtualizarSolicitacaoUseCase {
    constructor(private readonly solicitacaoRepository: ISolicitacaoRepository) {}

    /**
     * Atualiza parcialmente uma solicitação, verificando a propriedade do cliente logado.
     * - A descrição só pode ser alterada se o status atual for `'aberta'`.
     * - Via API (cliente), a única transição permitida é `aberta → cancelada`.
     * @param id - ID da solicitação a ser atualizada.
     * @param idCliente - ID do cliente autenticado extraído do token JWT.
     * @param dados - Campos a serem atualizados (todos opcionais).
     * @returns A solicitação atualizada.
     * @throws {RecursoNaoEncontradoError} Se a solicitação não existir.
     * @throws {AcessoProibidoError} Se a solicitação pertencer a outro cliente.
     * @throws {OperacaoNaoPermitidaError} Se a descrição for editada com status ≠ 'aberta'.
     * @throws {OperacaoNaoPermitidaError} Se a transição de status for inválida.
     */
    async execute(id: string, idCliente: string, dados: SolicitacaoAtualizacaoDTO): Promise<Solicitacao> {
        const solicitacao = await this.solicitacaoRepository.buscarPorId(id)
        if (!solicitacao) throw new RecursoNaoEncontradoError('Solicitação')
        if (solicitacao.idCliente !== idCliente) throw new AcessoProibidoError()

        if (dados.descricao !== undefined) {
            if (solicitacao.status !== StatusSolicitacao.ABERTA) {
                throw new OperacaoNaoPermitidaError(
                    "A descrição só pode ser alterada enquanto a solicitação estiver com status 'aberta'."
                )
            }
            solicitacao.descricao = dados.descricao
        }

        if (dados.status !== undefined) {
            const transicoesValidas = transicoesPermitidas[solicitacao.status] ?? []
            if (!transicoesValidas.includes(dados.status)) {
                throw new OperacaoNaoPermitidaError(
                    `Transição de status inválida: '${solicitacao.status}' → '${dados.status}'.`
                )
            }
            solicitacao.status = dados.status
        }

        return this.solicitacaoRepository.atualizar(solicitacao)
    }
}
