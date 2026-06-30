import { Types } from "mongoose";
import { RelatarProblemaContratoUseCase } from "./relatar-problema-contrato.use-case";
import { ContratоMother } from "../../../../test-helpers/contrato.mother";
import { StatusContrato } from "../../../value-objects/contrato/status/status.vo";
import { TipoProblema } from "../../../value-objects/contrato/problema/tipo-problema.vo";
import { RecursoNaoEncontradoError } from "../../../errors/recurso-nao-encontrado.error";
import { AcessoProibidoError } from "../../../errors/acesso-proibido.error";
import { OperacaoNaoPermitidaError } from "../../../errors/operacao-nao-permitida.error";
import { FormatoInvalidoError } from "../../../errors/formato-invalido.error";
import { ValorLimiteError } from "../../../errors/valor-limite.error";

describe('RelatarProblemaContratoUseCase', () => {
    let useCase: RelatarProblemaContratoUseCase
    let contratoRepoMock: ReturnType<typeof ContratоMother.criarRepositoryMock>

    const idCliente = new Types.ObjectId().toString()
    const dadosValidos = { tipo: TipoProblema.ATRASO, descricao: 'Descricao valida com mais de dez caracteres' }

    beforeEach(() => {
        contratoRepoMock = ContratоMother.criarRepositoryMock()
        useCase = new RelatarProblemaContratoUseCase(contratoRepoMock as any)
    })

    it('deve relatar problema em contrato concluído', async () => {
        // Arrange
        const contrato = ContratоMother.criarValido({ idCliente, status: StatusContrato.CONCLUIDO })
        contratoRepoMock.buscarPorId.mockResolvedValue(contrato)
        contratoRepoMock.atualizar.mockResolvedValue(contrato)

        // Act
        await useCase.execute(contrato.id!, idCliente, dadosValidos)

        // Assert
        expect(contrato.problema).toBeDefined()
        expect(contrato.problema?.tipo).toBe(TipoProblema.ATRASO)
        expect(contratoRepoMock.atualizar).toHaveBeenCalledTimes(1)
    })

    it('deve relatar problema em contrato cancelado', async () => {
        // Arrange
        const contrato = ContratоMother.criarValido({ idCliente, status: StatusContrato.CANCELADO })
        contratoRepoMock.buscarPorId.mockResolvedValue(contrato)
        contratoRepoMock.atualizar.mockResolvedValue(contrato)

        // Act
        await useCase.execute(contrato.id!, idCliente, dadosValidos)

        // Assert
        expect(contrato.problema).toBeDefined()
    })

    it('deve lançar RecursoNaoEncontradoError se contrato não existir', async () => {
        // Arrange
        contratoRepoMock.buscarPorId.mockResolvedValue(null)

        // Act & Assert
        await expect(useCase.execute(new Types.ObjectId().toString(), idCliente, dadosValidos))
            .rejects.toThrow(RecursoNaoEncontradoError)
    })

    it('deve lançar AcessoProibidoError se não for o cliente do contrato', async () => {
        // Arrange
        const contrato = ContratоMother.criarValido({ status: StatusContrato.CONCLUIDO })
        contratoRepoMock.buscarPorId.mockResolvedValue(contrato)

        // Act & Assert
        await expect(useCase.execute(contrato.id!, new Types.ObjectId().toString(), dadosValidos))
            .rejects.toThrow(AcessoProibidoError)
    })

    it('deve lançar OperacaoNaoPermitidaError se contrato estiver em andamento', async () => {
        // Arrange
        const contrato = ContratоMother.criarValido({ idCliente, status: StatusContrato.EM_ANDAMENTO })
        contratoRepoMock.buscarPorId.mockResolvedValue(contrato)

        // Act & Assert
        await expect(useCase.execute(contrato.id!, idCliente, dadosValidos))
            .rejects.toThrow(OperacaoNaoPermitidaError)
    })

    it('deve lançar FormatoInvalidoError se o tipo for inválido', async () => {
        // Arrange
        const contrato = ContratоMother.criarValido({ idCliente, status: StatusContrato.CONCLUIDO })
        contratoRepoMock.buscarPorId.mockResolvedValue(contrato)

        // Act & Assert
        await expect(useCase.execute(contrato.id!, idCliente, { tipo: 'tipo_invalido', descricao: dadosValidos.descricao }))
            .rejects.toThrow(FormatoInvalidoError)
    })

    it('deve lançar ValorLimiteError se a descricao for muito curta', async () => {
        // Arrange
        const contrato = ContratоMother.criarValido({ idCliente, status: StatusContrato.CONCLUIDO })
        contratoRepoMock.buscarPorId.mockResolvedValue(contrato)

        // Act & Assert
        await expect(useCase.execute(contrato.id!, idCliente, { tipo: TipoProblema.ATRASO, descricao: 'curta' }))
            .rejects.toThrow(ValorLimiteError)
    })
})
