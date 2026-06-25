import { Contrato } from "../../../entities/contrato/contrato.entity";
import { IContratoRepository } from "../../../repositories/contrato.repository";
import { ContratoAtualizacaoDTO } from "../../../dto/contrato/contrato-atualizacao.dto";
import { RecursoNaoEncontradoError } from "../../../errors/recurso-nao-encontrado.error";
import { AcessoProibidoError } from "../../../errors/acesso-proibido.error";
import { OperacaoNaoPermitidaError } from "../../../errors/operacao-nao-permitida.error";
import { StatusContrato } from "../../../value-objects/contrato/status/status.vo";

export class AtualizarContratoUseCase {
    constructor(private readonly contratoRepository: IContratoRepository) {}

    /**
     * Atualiza parcialmente um contrato pelo prestador dono.
     * `dataInicioEstimada` e `prazoEstimado` só podem ser alterados enquanto o
     * status for `'aguardando_inicio'` (RN07).
     *
     * @param id - ID do contrato a ser atualizado.
     * @param idPrestador - ID do prestador autenticado extraído do token JWT.
     * @param dados - Campos a serem atualizados (todos opcionais).
     * @returns O contrato atualizado.
     * @throws {RecursoNaoEncontradoError} Se o contrato não existir.
     * @throws {AcessoProibidoError} Se o prestador logado não for o do contrato.
     * @throws {OperacaoNaoPermitidaError} Se o status não for `'aguardando_inicio'`.
     */
    async execute(id: string, idPrestador: string, dados: ContratoAtualizacaoDTO): Promise<Contrato> {
        const contrato = await this.contratoRepository.buscarPorId(id)
        if (!contrato) throw new RecursoNaoEncontradoError('Contrato')
        if (contrato.idPrestador !== idPrestador) throw new AcessoProibidoError()

        if (contrato.status !== StatusContrato.AGUARDANDO_INICIO) {
            throw new OperacaoNaoPermitidaError(
                "O contrato só pode ser alterado enquanto estiver com status 'aguardando_inicio'."
            )
        }

        if (dados.dataInicioEstimada !== undefined) contrato.dataInicioEstimada = dados.dataInicioEstimada
        if (dados.prazoEstimado !== undefined) contrato.prazoEstimado = dados.prazoEstimado

        return this.contratoRepository.atualizar(contrato)
    }
}
