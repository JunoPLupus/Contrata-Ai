import { Contrato } from "../../../entities/contrato/contrato.entity";
import { IContratoRepository } from "../../../repositories/contrato.repository";
import { RecursoNaoEncontradoError } from "../../../errors/recurso-nao-encontrado.error";
import { AcessoProibidoError } from "../../../errors/acesso-proibido.error";
import { OperacaoNaoPermitidaError } from "../../../errors/operacao-nao-permitida.error";
import { StatusContrato } from "../../../value-objects/contrato/status/status.vo";

export class ConcluirContratoUseCase {
    constructor(private readonly contratoRepository: IContratoRepository) {}

    /**
     * Conclui um contrato, preenchendo `dataConclusao` e alterando o status para
     * `'concluido'`. Pode ser chamado pelo cliente ou pelo prestador do contrato (UC21/RF19).
     *
     * Este status é o gancho que libera o domínio de avaliação futuramente (RF22–RF24).
     *
     * @param id - ID do contrato a ser concluído.
     * @param idCliente - ID do usuário autenticado.
     * @param idPrestador - ID do prestador autenticado (pode ser `undefined`).
     * @returns O contrato concluído.
     * @throws {RecursoNaoEncontradoError} Se o contrato não existir.
     * @throws {AcessoProibidoError} Se o usuário não for parte do contrato.
     * @throws {OperacaoNaoPermitidaError} Se o status não for `'aguardando_confirmacao'`.
     */
    async execute(id: string, idCliente: string, idPrestador?: string): Promise<Contrato> {
        const contrato = await this.contratoRepository.buscarPorId(id)
        if (!contrato) throw new RecursoNaoEncontradoError('Contrato')

        const eParte = contrato.idCliente === idCliente || (idPrestador && contrato.idPrestador === idPrestador)
        if (!eParte) throw new AcessoProibidoError()

        if (contrato.status !== StatusContrato.AGUARDANDO_CONFIRMACAO) {
            throw new OperacaoNaoPermitidaError(
                "O contrato só pode ser concluído quando estiver com status 'aguardando_confirmacao'."
            )
        }

        contrato.concluir()
        return this.contratoRepository.atualizar(contrato)
    }
}
