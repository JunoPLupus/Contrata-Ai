import { Types } from "mongoose";
import { ResponderExtensaoPrazoUseCase } from "./responder-extensao-prazo.use-case";
import { ContratоMother } from "../../../../test-helpers/contrato.mother";
import { ExtensaoPrazoMother } from "../../../../test-helpers/extensao-prazo.mother";
import { StatusExtensaoPrazo } from "../../../value-objects/extensao-prazo/status/status.vo";
import { RecursoNaoEncontradoError } from "../../../errors/recurso-nao-encontrado.error";
import { AcessoProibidoError } from "../../../errors/acesso-proibido.error";
import { OperacaoNaoPermitidaError } from "../../../errors/operacao-nao-permitida.error";

describe('ResponderExtensaoPrazoUseCase', () => {
    let useCase: ResponderExtensaoPrazoUseCase
    let contratoRepoMock: ReturnType<typeof ContratоMother.criarRepositoryMock>
    let extensaoRepoMock: ReturnType<typeof ExtensaoPrazoMother.criarRepositoryMock>

    const idCliente = new Types.ObjectId().toString()
    const novoPrazo = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    beforeEach(() => {
        contratoRepoMock = ContratоMother.criarRepositoryMock()
        extensaoRepoMock = ExtensaoPrazoMother.criarRepositoryMock()
        useCase = new ResponderExtensaoPrazoUseCase(contratoRepoMock as any, extensaoRepoMock as any)
    })

    it('deve aprovar a extensão e atualizar prazoEstimado do contrato', async () => {
        // Arrange
        const contrato = ContratоMother.criarValido({ idCliente })
        const extensao = ExtensaoPrazoMother.criarValido({ idContrato: contrato.id!, novoPrazo })
        contratoRepoMock.buscarPorId.mockResolvedValue(contrato)
        extensaoRepoMock.buscarPorId.mockResolvedValue(extensao)
        extensaoRepoMock.atualizar.mockResolvedValue(extensao)
        contratoRepoMock.atualizar.mockResolvedValue(contrato)

        // Act
        await useCase.execute(contrato.id!, extensao.id!, idCliente, { decisao: StatusExtensaoPrazo.APROVADA })

        // Assert
        expect(extensao.status).toBe(StatusExtensaoPrazo.APROVADA)
        expect(extensao.dataResposta).toBeInstanceOf(Date)
        expect(contrato.prazoEstimado).toEqual(novoPrazo)
        expect(contratoRepoMock.atualizar).toHaveBeenCalledWith(contrato)
    })

    it('deve recusar a extensão e manter prazoEstimado do contrato', async () => {
        // Arrange
        const prazoOriginal = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
        const contrato = ContratоMother.criarValido({ idCliente, prazoEstimado: prazoOriginal })
        const extensao = ExtensaoPrazoMother.criarValido({ idContrato: contrato.id!, novoPrazo })
        contratoRepoMock.buscarPorId.mockResolvedValue(contrato)
        extensaoRepoMock.buscarPorId.mockResolvedValue(extensao)
        extensaoRepoMock.atualizar.mockResolvedValue(extensao)

        // Act
        await useCase.execute(contrato.id!, extensao.id!, idCliente, { decisao: StatusExtensaoPrazo.RECUSADA })

        // Assert
        expect(extensao.status).toBe(StatusExtensaoPrazo.RECUSADA)
        expect(contrato.prazoEstimado).toEqual(prazoOriginal)
        expect(contratoRepoMock.atualizar).not.toHaveBeenCalled()
    })

    it('deve lançar OperacaoNaoPermitidaError se extensão não estiver pendente', async () => {
        // Arrange
        const contrato = ContratоMother.criarValido({ idCliente })
        const extensao = ExtensaoPrazoMother.criarValido({ idContrato: contrato.id!, status: StatusExtensaoPrazo.APROVADA })
        contratoRepoMock.buscarPorId.mockResolvedValue(contrato)
        extensaoRepoMock.buscarPorId.mockResolvedValue(extensao)

        // Act & Assert
        await expect(useCase.execute(contrato.id!, extensao.id!, idCliente, { decisao: StatusExtensaoPrazo.RECUSADA }))
            .rejects.toThrow(OperacaoNaoPermitidaError)
    })

    it('deve lançar AcessoProibidoError se não for o cliente do contrato', async () => {
        // Arrange
        const contrato = ContratоMother.criarValido({ idCliente: new Types.ObjectId().toString() })
        const extensao = ExtensaoPrazoMother.criarValido({ idContrato: contrato.id! })
        contratoRepoMock.buscarPorId.mockResolvedValue(contrato)
        extensaoRepoMock.buscarPorId.mockResolvedValue(extensao)

        // Act & Assert
        await expect(useCase.execute(contrato.id!, extensao.id!, idCliente, { decisao: StatusExtensaoPrazo.APROVADA }))
            .rejects.toThrow(AcessoProibidoError)
    })

    it('deve lançar RecursoNaoEncontradoError se extensão não pertencer ao contrato', async () => {
        // Arrange
        const contrato = ContratоMother.criarValido({ idCliente })
        const extensao = ExtensaoPrazoMother.criarValido({ idContrato: new Types.ObjectId().toString() })
        contratoRepoMock.buscarPorId.mockResolvedValue(contrato)
        extensaoRepoMock.buscarPorId.mockResolvedValue(extensao)

        // Act & Assert
        await expect(useCase.execute(contrato.id!, extensao.id!, idCliente, { decisao: StatusExtensaoPrazo.APROVADA }))
            .rejects.toThrow(RecursoNaoEncontradoError)
    })

    it('deve lançar RecursoNaoEncontradoError se contrato não existir', async () => {
        // Arrange
        contratoRepoMock.buscarPorId.mockResolvedValue(null)

        // Act & Assert
        await expect(useCase.execute('id-inexistente', 'id-ext', idCliente, { decisao: StatusExtensaoPrazo.APROVADA }))
            .rejects.toThrow(RecursoNaoEncontradoError)
    })
})
