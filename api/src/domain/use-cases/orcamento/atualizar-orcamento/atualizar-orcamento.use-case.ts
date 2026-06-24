import { Orcamento } from "../../../entities/orcamento/orcamento.entity";
import { IOrcamentoRepository } from "../../../repositories/orcamento.repository";
import { OrcamentoAtualizacaoDTO } from "../../../dto/orcamento/orcamento-atualizacao.dto";
import { RecursoNaoEncontradoError } from "../../../errors/recurso-nao-encontrado.error";
import { AcessoProibidoError } from "../../../errors/acesso-proibido.error";
import { OperacaoNaoPermitidaError } from "../../../errors/operacao-nao-permitida.error";
import { StatusOrcamento } from "../../../value-objects/orcamento/status/status.vo";

const transicoesPermitidas: Record<string, string[]> = {
    [StatusOrcamento.PENDENTE]: [StatusOrcamento.CANCELADO],
    [StatusOrcamento.ACEITO]: [],
    [StatusOrcamento.ENCERRADO]: [],
    [StatusOrcamento.CANCELADO]: [],
}

export class AtualizarOrcamentoUseCase {
    constructor(private readonly orcamentoRepository: IOrcamentoRepository) {}

    /**
     * Atualiza parcialmente um orçamento pelo prestador dono.
     * - `valor` e `prazoDias` só podem ser alterados enquanto o status for `'pendente'`.
     * - A única transição de status permitida ao prestador é `pendente → cancelado`.
     * @param id - ID do orçamento a ser atualizado.
     * @param idPrestador - ID do prestador autenticado extraído do token JWT.
     * @param dados - Campos a serem atualizados (todos opcionais).
     * @returns O orçamento atualizado.
     * @throws {RecursoNaoEncontradoError} Se o orçamento não existir.
     * @throws {AcessoProibidoError} Se o orçamento pertencer a outro prestador.
     * @throws {OperacaoNaoPermitidaError} Se tentar editar com status diferente de `'pendente'`.
     * @throws {OperacaoNaoPermitidaError} Se a transição de status for inválida.
     */
    async execute(id: string, idPrestador: string, dados: OrcamentoAtualizacaoDTO): Promise<Orcamento> {
        const orcamento = await this.orcamentoRepository.buscarPorId(id)
        if (!orcamento) throw new RecursoNaoEncontradoError('Orçamento')
        if (orcamento.idPrestador !== idPrestador) throw new AcessoProibidoError()

        if (orcamento.status !== StatusOrcamento.PENDENTE) {
            throw new OperacaoNaoPermitidaError(
                "O orçamento só pode ser alterado enquanto estiver com status 'pendente'."
            )
        }

        if (dados.valor !== undefined) orcamento.valor = dados.valor

        if (dados.prazoDias !== undefined) orcamento.prazoDias = dados.prazoDias

        if (dados.status !== undefined) {
            const transicoesValidas = transicoesPermitidas[orcamento.status] ?? []
            if (!transicoesValidas.includes(dados.status)) {
                throw new OperacaoNaoPermitidaError(
                    `Transição de status inválida: '${orcamento.status}' → '${dados.status}'.`
                )
            }
            orcamento.status = dados.status
        }

        return this.orcamentoRepository.atualizar(orcamento)
    }
}
