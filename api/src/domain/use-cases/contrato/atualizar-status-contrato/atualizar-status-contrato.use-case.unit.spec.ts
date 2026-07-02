import { Types } from "mongoose";
import { AtualizarStatusContratoUseCase } from "./atualizar-status-contrato.use-case";
import { ContratоMother } from "../../../../test-helpers/contrato.mother";
import { StatusContrato } from "../../../value-objects/contrato/status/status.vo";
import { RecursoNaoEncontradoError } from "../../../errors/recurso-nao-encontrado.error";
import { AcessoProibidoError } from "../../../errors/acesso-proibido.error";
import { OperacaoNaoPermitidaError } from "../../../errors/operacao-nao-permitida.error";

describe('AtualizarStatusContratoUseCase', () => {
    let useCase: AtualizarStatusContratoUseCase
    let contratoRepoMock: ReturnType<typeof ContratоMother.criarRepositoryMock>

    const idPrestador = new Types.ObjectId().toString()

    beforeEach(() => {
        contratoRepoMock = ContratоMother.criarRepositoryMock()
        useCase = new AtualizarStatusContratoUseCase(contratoRepoMock)
    })

    it('deve transicionar aguardando_inicio → em_andamento', async () => {
        // Arrange
        const contrato = ContratоMother.criarValido({ idPrestador, status: StatusContrato.AGUARDANDO_INICIO })
        contratoRepoMock.buscarPorId.mockResolvedValue(contrato)
        contratoRepoMock.atualizar.mockResolvedValue(contrato)

        // Act
        await useCase.execute(contrato.id!, idPrestador, { status: StatusContrato.EM_ANDAMENTO })

        // Assert
        expect(contrato.status).toBe(StatusContrato.EM_ANDAMENTO)
    })

    it('deve transicionar em_andamento → aguardando_confirmacao', async () => {
        // Arrange
        const contrato = ContratоMother.criarValido({ idPrestador, status: StatusContrato.EM_ANDAMENTO })
        contratoRepoMock.buscarPorId.mockResolvedValue(contrato)
        contratoRepoMock.atualizar.mockResolvedValue(contrato)

        // Act
        await useCase.execute(contrato.id!, idPrestador, { status: StatusContrato.AGUARDANDO_CONFIRMACAO })

        // Assert
        expect(contrato.status).toBe(StatusContrato.AGUARDANDO_CONFIRMACAO)
    })

    it('deve lançar OperacaoNaoPermitidaError em transição inválida', async () => {
        // Arrange
        const contrato = ContratоMother.criarValido({ idPrestador, status: StatusContrato.AGUARDANDO_CONFIRMACAO })
        contratoRepoMock.buscarPorId.mockResolvedValue(contrato)

        // Act & Assert
        await expect(useCase.execute(contrato.id!, idPrestador, { status: StatusContrato.EM_ANDAMENTO }))
            .rejects.toThrow(OperacaoNaoPermitidaError)
    })

    it('deve lançar OperacaoNaoPermitidaError ao tentar ir direto para concluido', async () => {
        // Arrange
        const contrato = ContratоMother.criarValido({ idPrestador, status: StatusContrato.EM_ANDAMENTO })
        contratoRepoMock.buscarPorId.mockResolvedValue(contrato)

        // Act & Assert
        await expect(useCase.execute(contrato.id!, idPrestador, { status: StatusContrato.CONCLUIDO }))
            .rejects.toThrow(OperacaoNaoPermitidaError)
    })

    it('deve lançar AcessoProibidoError se não for o prestador do contrato', async () => {
        // Arrange
        const contrato = ContratоMother.criarValido({ status: StatusContrato.AGUARDANDO_INICIO })
        contratoRepoMock.buscarPorId.mockResolvedValue(contrato)

        // Act & Assert
        await expect(useCase.execute(contrato.id!, new Types.ObjectId().toString(), { status: StatusContrato.EM_ANDAMENTO }))
            .rejects.toThrow(AcessoProibidoError)
    })

    it('deve lançar RecursoNaoEncontradoError se contrato não existir', async () => {
        // Arrange
        contratoRepoMock.buscarPorId.mockResolvedValue(null)

        // Act & Assert
        await expect(useCase.execute('id-inexistente', idPrestador, { status: StatusContrato.EM_ANDAMENTO }))
            .rejects.toThrow(RecursoNaoEncontradoError)
    })
})
