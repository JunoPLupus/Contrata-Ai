import { Contrato } from "../../../entities/contrato/contrato.entity";
import { IContratoRepository } from "../../../repositories/contrato.repository";
import { ContratoProblemaDTO } from "../../../dto/contrato/contrato-problema.dto";
import { RecursoNaoEncontradoError } from "../../../errors/recurso-nao-encontrado.error";
import { AcessoProibidoError } from "../../../errors/acesso-proibido.error";
import { OperacaoNaoPermitidaError } from "../../../errors/operacao-nao-permitida.error";
import { StatusContrato } from "../../../value-objects/contrato/status/status.vo";

const statusPermitidos = [StatusContrato.CONCLUIDO, StatusContrato.CANCELADO]

export class RelatarProblemaContratoUseCase {
    constructor(private readonly contratoRepository: IContratoRepository) {}

    /**
     * Registra um problema em um contrato concluído ou cancelado (RF24).
     *
     * Regras:
     * - O contrato deve existir.
     * - Só o cliente do contrato pode relatar o problema.
     * - O contrato deve estar com status `concluido` ou `cancelado`.
     * - A `descricao` é validada pelos VOs (mínimo 10 caracteres).
     *
     * @param id - ID do contrato.
     * @param idCliente - ID do cliente autenticado (do token).
     * @param dados - DTO com `tipo` e `descricao` do problema.
     * @returns O contrato atualizado com o problema registrado.
     * @throws {RecursoNaoEncontradoError} Se o contrato não existir.
     * @throws {AcessoProibidoError} Se o cliente não for o dono do contrato.
     * @throws {OperacaoNaoPermitidaError} Se o status não for `concluido` nem `cancelado`.
     */
    async execute(id: string, idCliente: string, dados: ContratoProblemaDTO): Promise<Contrato> {
        const contrato = await this.contratoRepository.buscarPorId(id)
        if (!contrato) throw new RecursoNaoEncontradoError('Contrato')

        if (contrato.idCliente !== idCliente) throw new AcessoProibidoError()

        if (!statusPermitidos.includes(contrato.status as any)) {
            throw new OperacaoNaoPermitidaError('Só é possível relatar um problema em contratos concluídos ou cancelados.')
        }

        contrato.relatarProblema(dados.tipo, dados.descricao)

        return this.contratoRepository.atualizar(contrato)
    }
}
