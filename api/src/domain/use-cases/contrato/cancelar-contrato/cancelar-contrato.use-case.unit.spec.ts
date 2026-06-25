import { Types } from "mongoose";
import { CancelarContratoUseCase } from "./cancelar-contrato.use-case";
import { ContratоMother } from "../../../../test-helpers/contrato.mother";
import { StatusContrato } from "../../../value-objects/contrato/status/status.vo";
import { RecursoNaoEncontradoError } from "../../../errors/recurso-nao-encontrado.error";
import { AcessoProibidoError } from "../../../errors/acesso-proibido.error";
import { OperacaoNaoPermitidaError } from "../../../errors/operacao-nao-permitida.error";
import { CampoObrigatorioVazioError } from "../../../errors/campo-obrigatorio-vazio.error";

describe('CancelarContratoUseCase', () => {
    let useCase: CancelarContratoUseCase
    let contratoRepoMock: ReturnType<typeof ContratоMother.criarRepositoryMock>
    let usuarioRepoMock: jest.Mocked<{ incrementarFlagCancelamento: jest.Mock }>

    const idCliente = new Types.ObjectId().toString()
    const idPrestador = new Types.ObjectId().toString()
    const motivo = 'Motivo de cancelamento válido'

    beforeEach(() => {
        contratoRepoMock = ContratоMother.criarRepositoryMock()
        usuarioRepoMock = { incrementarFlagCancelamento: jest.fn() } as any
        useCase = new CancelarContratoUseCase(contratoRepoMock as any, usuarioRepoMock as any)
    })

    it('deve cancelar o contrato com motivo válido', async () => {
        // Arrange
        const contrato = ContratоMother.criarValido({ idCliente, status: StatusContrato.EM_ANDAMENTO })
        contratoRepoMock.buscarPorId.mockResolvedValue(contrato)
        contratoRepoMock.atualizar.mockResolvedValue(contrato)
        usuarioRepoMock.incrementarFlagCancelamento.mockResolvedValue(undefined)

        // Act
        await useCase.execute(contrato.id!, idCliente, undefined, { motivo })

        // Assert
        expect(contrato.status).toBe(StatusContrato.CANCELADO)
        expect(contrato.motivoCancelamento).toBe(motivo)
        expect(contrato.canceladoPor).toBe(idCliente)
    })

    it('deve incrementar flag de reputação quando cancelado dentro do prazo', async () => {
        // Arrange
        const prazoFuturo = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        const contrato = ContratоMother.criarValido({ idCliente, status: StatusContrato.EM_ANDAMENTO, prazoEstimado: prazoFuturo })
        contratoRepoMock.buscarPorId.mockResolvedValue(contrato)
        contratoRepoMock.atualizar.mockResolvedValue(contrato)
        usuarioRepoMock.incrementarFlagCancelamento.mockResolvedValue(undefined)

        // Act
        await useCase.execute(contrato.id!, idCliente, undefined, { motivo })

        // Assert
        expect(usuarioRepoMock.incrementarFlagCancelamento).toHaveBeenCalledWith(idCliente)
    })

    it('não deve incrementar flag quando cancelado em atraso', async () => {
        // Arrange
        const prazoPassado = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        const contrato = ContratоMother.criarValido({ idCliente, status: StatusContrato.EM_ANDAMENTO, prazoEstimado: prazoPassado })
        contratoRepoMock.buscarPorId.mockResolvedValue(contrato)
        contratoRepoMock.atualizar.mockResolvedValue(contrato)

        // Act
        await useCase.execute(contrato.id!, idCliente, undefined, { motivo })

        // Assert
        expect(usuarioRepoMock.incrementarFlagCancelamento).not.toHaveBeenCalled()
    })

    it('deve lançar CampoObrigatorioVazioError se motivo estiver vazio', async () => {
        // Arrange
        const contrato = ContratоMother.criarValido({ idCliente, status: StatusContrato.EM_ANDAMENTO })
        contratoRepoMock.buscarPorId.mockResolvedValue(contrato)

        // Act & Assert
        await expect(useCase.execute(contrato.id!, idCliente, undefined, { motivo: '' }))
            .rejects.toThrow(CampoObrigatorioVazioError)
    })

    it('deve lançar OperacaoNaoPermitidaError se contrato já estiver concluído', async () => {
        // Arrange
        const contrato = ContratоMother.criarValido({ idCliente, status: StatusContrato.CONCLUIDO })
        contratoRepoMock.buscarPorId.mockResolvedValue(contrato)

        // Act & Assert
        await expect(useCase.execute(contrato.id!, idCliente, undefined, { motivo }))
            .rejects.toThrow(OperacaoNaoPermitidaError)
    })

    it('deve lançar OperacaoNaoPermitidaError se contrato já estiver cancelado', async () => {
        // Arrange
        const contrato = ContratоMother.criarValido({ idCliente, status: StatusContrato.CANCELADO })
        contratoRepoMock.buscarPorId.mockResolvedValue(contrato)

        // Act & Assert
        await expect(useCase.execute(contrato.id!, idCliente, undefined, { motivo }))
            .rejects.toThrow(OperacaoNaoPermitidaError)
    })

    it('deve lançar AcessoProibidoError se o usuário não for parte', async () => {
        // Arrange
        const contrato = ContratоMother.criarValido({ status: StatusContrato.EM_ANDAMENTO })
        contratoRepoMock.buscarPorId.mockResolvedValue(contrato)

        // Act & Assert
        await expect(useCase.execute(contrato.id!, new Types.ObjectId().toString(), undefined, { motivo }))
            .rejects.toThrow(AcessoProibidoError)
    })

    it('deve lançar RecursoNaoEncontradoError se contrato não existir', async () => {
        // Arrange
        contratoRepoMock.buscarPorId.mockResolvedValue(null)

        // Act & Assert
        await expect(useCase.execute('id-inexistente', idCliente, undefined, { motivo }))
            .rejects.toThrow(RecursoNaoEncontradoError)
    })
})
