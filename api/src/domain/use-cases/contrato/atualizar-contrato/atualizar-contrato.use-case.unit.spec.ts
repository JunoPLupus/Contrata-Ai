import { Types } from "mongoose";
import { AtualizarContratoUseCase } from "./atualizar-contrato.use-case";
import { ContratоMother } from "../../../../test-helpers/contrato.mother";
import { StatusContrato } from "../../../value-objects/contrato/status/status.vo";
import { RecursoNaoEncontradoError } from "../../../errors/recurso-nao-encontrado.error";
import { AcessoProibidoError } from "../../../errors/acesso-proibido.error";
import { OperacaoNaoPermitidaError } from "../../../errors/operacao-nao-permitida.error";

describe('AtualizarContratoUseCase', () => {
    let useCase: AtualizarContratoUseCase
    let contratoRepoMock: ReturnType<typeof ContratоMother.criarRepositoryMock>

    const idPrestador = new Types.ObjectId().toString()

    beforeEach(() => {
        contratoRepoMock = ContratоMother.criarRepositoryMock()
        useCase = new AtualizarContratoUseCase(contratoRepoMock)
    })

    it('deve atualizar campos permitidos em status aguardando_inicio', async () => {
        // Arrange
        const contrato = ContratоMother.criarValido({ idPrestador, status: StatusContrato.AGUARDANDO_INICIO })
        const novaData = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        contratoRepoMock.buscarPorId.mockResolvedValue(contrato)
        contratoRepoMock.atualizar.mockResolvedValue(contrato)

        // Act
        await useCase.execute(contrato.id!, idPrestador, { prazoEstimado: novaData })

        // Assert
        expect(contrato.prazoEstimado).toEqual(novaData)
        expect(contratoRepoMock.atualizar).toHaveBeenCalledWith(contrato)
    })

    it('deve lançar OperacaoNaoPermitidaError se status não for aguardando_inicio', async () => {
        // Arrange
        const contrato = ContratоMother.criarValido({ idPrestador, status: StatusContrato.EM_ANDAMENTO })
        contratoRepoMock.buscarPorId.mockResolvedValue(contrato)

        // Act & Assert
        await expect(useCase.execute(contrato.id!, idPrestador, { prazoEstimado: new Date() }))
            .rejects.toThrow(OperacaoNaoPermitidaError)
    })

    it('deve lançar AcessoProibidoError se o prestador não for o do contrato', async () => {
        // Arrange
        const contrato = ContratоMother.criarValido({ status: StatusContrato.AGUARDANDO_INICIO })
        contratoRepoMock.buscarPorId.mockResolvedValue(contrato)

        // Act & Assert
        await expect(useCase.execute(contrato.id!, new Types.ObjectId().toString(), {}))
            .rejects.toThrow(AcessoProibidoError)
    })

    it('deve lançar RecursoNaoEncontradoError se contrato não existir', async () => {
        // Arrange
        contratoRepoMock.buscarPorId.mockResolvedValue(null)

        // Act & Assert
        await expect(useCase.execute('id-inexistente', idPrestador, {}))
            .rejects.toThrow(RecursoNaoEncontradoError)
    })
})
