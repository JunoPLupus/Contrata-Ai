import { Types } from "mongoose";
import { SolicitarExtensaoPrazoUseCase } from "./solicitar-extensao-prazo.use-case";
import { ContratоMother } from "../../../../test-helpers/contrato.mother";
import { ExtensaoPrazoMother } from "../../../../test-helpers/extensao-prazo.mother";
import { StatusContrato } from "../../../value-objects/contrato/status/status.vo";
import { StatusExtensaoPrazo } from "../../../value-objects/extensao-prazo/status/status.vo";
import { RecursoNaoEncontradoError } from "../../../errors/recurso-nao-encontrado.error";
import { AcessoProibidoError } from "../../../errors/acesso-proibido.error";
import { OperacaoNaoPermitidaError } from "../../../errors/operacao-nao-permitida.error";

describe('SolicitarExtensaoPrazoUseCase', () => {
    let useCase: SolicitarExtensaoPrazoUseCase
    let contratoRepoMock: ReturnType<typeof ContratоMother.criarRepositoryMock>
    let extensaoRepoMock: ReturnType<typeof ExtensaoPrazoMother.criarRepositoryMock>

    const idPrestador = new Types.ObjectId().toString()
    const prazoAtual = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
    const novoPrazo = new Date(Date.now() + 20 * 24 * 60 * 60 * 1000)

    beforeEach(() => {
        contratoRepoMock = ContratоMother.criarRepositoryMock()
        extensaoRepoMock = ExtensaoPrazoMother.criarRepositoryMock()
        useCase = new SolicitarExtensaoPrazoUseCase(contratoRepoMock as any, extensaoRepoMock as any)
    })

    it('deve criar extensão pendente com dados válidos', async () => {
        // Arrange
        const contrato = ContratоMother.criarValido({ idPrestador, status: StatusContrato.EM_ANDAMENTO, prazoEstimado: prazoAtual })
        const extensaoEsperada = ExtensaoPrazoMother.criarValido({ idContrato: contrato.id!, novoPrazo })
        contratoRepoMock.buscarPorId.mockResolvedValue(contrato)
        extensaoRepoMock.inserir.mockResolvedValue(extensaoEsperada)

        // Act
        const resultado = await useCase.execute(contrato.id!, idPrestador, { novoPrazo, justificativa: 'Preciso de mais tempo.' })

        // Assert
        expect(extensaoRepoMock.inserir).toHaveBeenCalledTimes(1)
        expect(resultado.status).toBe(StatusExtensaoPrazo.PENDENTE)
    })

    it('deve lançar OperacaoNaoPermitidaError se novoPrazo <= prazoEstimado atual', async () => {
        // Arrange
        const prazoFuturo = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        const contrato = ContratоMother.criarValido({ idPrestador, status: StatusContrato.EM_ANDAMENTO, prazoEstimado: prazoFuturo })
        contratoRepoMock.buscarPorId.mockResolvedValue(contrato)

        // Act & Assert
        await expect(useCase.execute(contrato.id!, idPrestador, { novoPrazo: prazoAtual, justificativa: 'Qualquer.' }))
            .rejects.toThrow(OperacaoNaoPermitidaError)
    })

    it('deve lançar OperacaoNaoPermitidaError se contrato estiver em estado terminal', async () => {
        // Arrange
        const contrato = ContratоMother.criarValido({ idPrestador, status: StatusContrato.CONCLUIDO })
        contratoRepoMock.buscarPorId.mockResolvedValue(contrato)

        // Act & Assert
        await expect(useCase.execute(contrato.id!, idPrestador, { novoPrazo, justificativa: 'Qualquer.' }))
            .rejects.toThrow(OperacaoNaoPermitidaError)
    })

    it('deve lançar AcessoProibidoError se não for o prestador do contrato', async () => {
        // Arrange
        const contrato = ContratоMother.criarValido({ status: StatusContrato.EM_ANDAMENTO })
        contratoRepoMock.buscarPorId.mockResolvedValue(contrato)

        // Act & Assert
        await expect(useCase.execute(contrato.id!, new Types.ObjectId().toString(), { novoPrazo, justificativa: 'Qualquer.' }))
            .rejects.toThrow(AcessoProibidoError)
    })

    it('deve lançar RecursoNaoEncontradoError se contrato não existir', async () => {
        // Arrange
        contratoRepoMock.buscarPorId.mockResolvedValue(null)

        // Act & Assert
        await expect(useCase.execute('id-inexistente', idPrestador, { novoPrazo, justificativa: 'Qualquer.' }))
            .rejects.toThrow(RecursoNaoEncontradoError)
    })
})
