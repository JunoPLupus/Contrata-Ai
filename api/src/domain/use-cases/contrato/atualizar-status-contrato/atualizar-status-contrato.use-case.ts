import { Contrato } from "../../../entities/contrato/contrato.entity";
import { IContratoRepository } from "../../../repositories/contrato.repository";
import { ContratoStatusDTO } from "../../../dto/contrato/contrato-status.dto";
import { RecursoNaoEncontradoError } from "../../../errors/recurso-nao-encontrado.error";
import { AcessoProibidoError } from "../../../errors/acesso-proibido.error";
import { OperacaoNaoPermitidaError } from "../../../errors/operacao-nao-permitida.error";
import { StatusContrato } from "../../../value-objects/contrato/status/status.vo";

const transicoesPermitidas: Record<string, string[]> = {
    [StatusContrato.AGUARDANDO_INICIO]: [StatusContrato.EM_ANDAMENTO],
    [StatusContrato.EM_ANDAMENTO]: [StatusContrato.AGUARDANDO_CONFIRMACAO],
    [StatusContrato.AGUARDANDO_CONFIRMACAO]: [],
    [StatusContrato.CONCLUIDO]: [],
    [StatusContrato.CANCELADO]: [],
}

export class AtualizarStatusContratoUseCase {
    constructor(private readonly contratoRepository: IContratoRepository) {}

    /**
     * Atualiza o status de um contrato pelo prestador.
     * Transições permitidas: `aguardando_inicio → em_andamento` e
     * `em_andamento → aguardando_confirmacao`.
     * Conclusão e cancelamento possuem endpoints próprios e não são aceitos aqui.
     *
     * @param id - ID do contrato.
     * @param idPrestador - ID do prestador autenticado extraído do token JWT.
     * @param dados - DTO contendo o novo status desejado.
     * @returns O contrato com o status atualizado.
     * @throws {RecursoNaoEncontradoError} Se o contrato não existir.
     * @throws {AcessoProibidoError} Se o prestador logado não for o do contrato.
     * @throws {OperacaoNaoPermitidaError} Se a transição de status for inválida.
     */
    async execute(id: string, idPrestador: string, dados: ContratoStatusDTO): Promise<Contrato> {
        const contrato = await this.contratoRepository.buscarPorId(id)
        if (!contrato) throw new RecursoNaoEncontradoError('Contrato')
        if (contrato.idPrestador !== idPrestador) throw new AcessoProibidoError()

        const transicoesValidas = transicoesPermitidas[contrato.status] ?? []
        if (!transicoesValidas.includes(dados.status)) {
            throw new OperacaoNaoPermitidaError(
                `Transição de status inválida: '${contrato.status}' → '${dados.status}'.`
            )
        }

        contrato.status = dados.status
        return this.contratoRepository.atualizar(contrato)
    }
}
