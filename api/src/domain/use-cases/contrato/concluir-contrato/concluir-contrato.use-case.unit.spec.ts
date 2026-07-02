import { Types } from "mongoose";
import { ConcluirContratoUseCase } from "./concluir-contrato.use-case";
import { ContratоMother } from "../../../../test-helpers/contrato.mother";
import { StatusContrato } from "../../../value-objects/contrato/status/status.vo";
import { RecursoNaoEncontradoError } from "../../../errors/recurso-nao-encontrado.error";
import { AcessoProibidoError } from "../../../errors/acesso-proibido.error";
import { OperacaoNaoPermitidaError } from "../../../errors/operacao-nao-permitida.error";

describe('ConcluirContratoUseCase', () => {
    let useCase: ConcluirContratoUseCase
    let contratoRepoMock: ReturnType<typeof ContratоMother.criarRepositoryMock>

    const idCliente = new Types.ObjectId().toString()
    const idPrestador = new Types.ObjectId().toString()

    beforeEach(() => {
        contratoRepoMock = ContratоMother.criarRepositoryMock()
        useCase = new ConcluirContratoUseCase(contratoRepoMock)
    })

    it('deve concluir o contrato e preencher dataConclusao (como cliente)', async () => {
        // Arrange
        const contrato = ContratоMother.criarValido({ idCliente, status: StatusContrato.AGUARDANDO_CONFIRMACAO })
        contratoRepoMock.buscarPorId.mockResolvedValue(contrato)
        contratoRepoMock.atualizar.mockResolvedValue(contrato)

        // Act
        await useCase.execute(contrato.id!, idCliente)

        // Assert
        expect(contrato.status).toBe(StatusContrato.CONCLUIDO)
        expect(contrato.dataConclusao).toBeInstanceOf(Date)
    })

    it('deve concluir o contrato como prestador', async () => {
        // Arrange
        const contrato = ContratоMother.criarValido({ idPrestador, status: StatusContrato.AGUARDANDO_CONFIRMACAO })
        contratoRepoMock.buscarPorId.mockResolvedValue(contrato)
        contratoRepoMock.atualizar.mockResolvedValue(contrato)

        // Act
        await useCase.execute(contrato.id!, new Types.ObjectId().toString(), idPrestador)

        // Assert
        expect(contrato.status).toBe(StatusContrato.CONCLUIDO)
    })

    it('deve lançar OperacaoNaoPermitidaError se status não for aguardando_confirmacao', async () => {
        // Arrange
        const contrato = ContratоMother.criarValido({ idCliente, status: StatusContrato.EM_ANDAMENTO })
        contratoRepoMock.buscarPorId.mockResolvedValue(contrato)

        // Act & Assert
        await expect(useCase.execute(contrato.id!, idCliente))
            .rejects.toThrow(OperacaoNaoPermitidaError)
    })

    it('deve lançar AcessoProibidoError se o usuário não for parte', async () => {
        // Arrange
        const contrato = ContratоMother.criarValido({ status: StatusContrato.AGUARDANDO_CONFIRMACAO })
        contratoRepoMock.buscarPorId.mockResolvedValue(contrato)

        // Act & Assert
        await expect(useCase.execute(contrato.id!, new Types.ObjectId().toString()))
            .rejects.toThrow(AcessoProibidoError)
    })

    it('deve lançar RecursoNaoEncontradoError se contrato não existir', async () => {
        // Arrange
        contratoRepoMock.buscarPorId.mockResolvedValue(null)

        // Act & Assert
        await expect(useCase.execute('id-inexistente', idCliente))
            .rejects.toThrow(RecursoNaoEncontradoError)
    })
})
