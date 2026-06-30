import { Contrato } from "../../../entities/contrato/contrato.entity";
import { IContratoRepository } from "../../../repositories/contrato.repository";
import { IUsuarioRepository } from "../../../repositories/usuario.repository";
import { ContratoCancelamentoDTO } from "../../../dto/contrato/contrato-cancelamento.dto";
import { RecursoNaoEncontradoError } from "../../../errors/recurso-nao-encontrado.error";
import { AcessoProibidoError } from "../../../errors/acesso-proibido.error";
import { OperacaoNaoPermitidaError } from "../../../errors/operacao-nao-permitida.error";
import { CampoObrigatorioVazioError } from "../../../errors/campo-obrigatorio-vazio.error";
import { StatusContrato } from "../../../value-objects/contrato/status/status.vo";

const statusAtivos = [
    StatusContrato.AGUARDANDO_INICIO,
    StatusContrato.EM_ANDAMENTO,
    StatusContrato.AGUARDANDO_CONFIRMACAO,
]

export class CancelarContratoUseCase {
    constructor(
        private readonly contratoRepository: IContratoRepository,
        private readonly usuarioRepository: IUsuarioRepository
    ) {}

    /**
     * Cancela um contrato ativo, registrando motivo e responsável (UC18/RF17/RN04).
     *
     * Se o cancelamento ocorrer dentro do prazo (`estaDentroDoPrazo() === true`),
     * incrementa o campo `reputacao_flag_cancelamento` do usuário cancelante (RN04).
     * O ID do cancelante é sempre `idCliente` do token (independente do papel exercido).
     *
     * @param id - ID do contrato a ser cancelado.
     * @param idCliente - ID do usuário autenticado (= `_id` do usuário no token).
     * @param idPrestador - ID do prestador autenticado (pode ser `undefined`).
     * @param dados - DTO com o motivo obrigatório do cancelamento.
     * @returns O contrato cancelado.
     * @throws {RecursoNaoEncontradoError} Se o contrato não existir.
     * @throws {AcessoProibidoError} Se o usuário não for parte do contrato.
     * @throws {CampoObrigatorioVazioError} Se o motivo estiver vazio.
     * @throws {OperacaoNaoPermitidaError} Se o contrato estiver em estado terminal.
     */
    async execute(id: string, idCliente: string, idPrestador: string | undefined, dados: ContratoCancelamentoDTO): Promise<Contrato> {
        const contrato = await this.contratoRepository.buscarPorId(id)
        if (!contrato) throw new RecursoNaoEncontradoError('Contrato')

        const eParte = contrato.idCliente === idCliente || (idPrestador && contrato.idPrestador === idPrestador)
        if (!eParte) throw new AcessoProibidoError()

        if (!dados.motivo || dados.motivo.trim() === '') {
            throw new CampoObrigatorioVazioError('motivo')
        }

        if (!statusAtivos.includes(contrato.status as any)) {
            throw new OperacaoNaoPermitidaError(
                'Não é possível cancelar um contrato já concluído ou cancelado.'
            )
        }

        if (contrato.estaDentroDoPrazo()) {
            await this.usuarioRepository.incrementarFlagCancelamento(idCliente)
        }

        contrato.cancelar(dados.motivo, idCliente)
        return this.contratoRepository.atualizar(contrato)
    }
}
