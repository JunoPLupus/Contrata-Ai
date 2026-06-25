import { Types } from "mongoose";
import { CadastrarAvaliacaoUseCase } from "./cadastrar-avaliacao.use-case";
import { AvaliacaoMother } from "../../../../test-helpers/avaliacao.mother";
import { ContratоMother } from "../../../../test-helpers/contrato.mother";
import { StatusContrato } from "../../../value-objects/contrato/status/status.vo";
import { RecursoNaoEncontradoError } from "../../../errors/recurso-nao-encontrado.error";
import { AcessoProibidoError } from "../../../errors/acesso-proibido.error";
import { OperacaoNaoPermitidaError } from "../../../errors/operacao-nao-permitida.error";

describe('CadastrarAvaliacaoUseCase', () => {
    let useCase: CadastrarAvaliacaoUseCase
    let avaliacaoRepoMock: ReturnType<typeof AvaliacaoMother.criarRepositoryMock>
    let contratoRepoMock: ReturnType<typeof ContratоMother.criarRepositoryMock>

    const idCliente = new Types.ObjectId().toString()
    const idPrestador = new Types.ObjectId().toString()
    const idContrato = new Types.ObjectId().toString()

    beforeEach(() => {
        avaliacaoRepoMock = AvaliacaoMother.criarRepositoryMock()
        contratoRepoMock = ContratоMother.criarRepositoryMock()
        useCase = new CadastrarAvaliacaoUseCase(avaliacaoRepoMock as any, contratoRepoMock as any)
    })

    it('deve cadastrar avaliação com dados válidos', async () => {
        // Arrange
        const contrato = ContratоMother.criarValido({ idCliente, idPrestador, status: StatusContrato.CONCLUIDO })
        contratoRepoMock.buscarPorId.mockResolvedValue(contrato)
        avaliacaoRepoMock.buscarPorIdContrato.mockResolvedValue(null)
        const avaliacaoCriada = AvaliacaoMother.criarValido({ idContrato, idCliente, idPrestador })
        avaliacaoRepoMock.inserir.mockResolvedValue(avaliacaoCriada)

        // Act
        const resultado = await useCase.execute({ idContrato, nota: 5 }, idCliente)

        // Assert
        expect(avaliacaoRepoMock.inserir).toHaveBeenCalledTimes(1)
        expect(resultado.idCliente).toBe(idCliente)
    })

    it('deve lançar RecursoNaoEncontradoError se o contrato não existir', async () => {
        // Arrange
        contratoRepoMock.buscarPorId.mockResolvedValue(null)

        // Act & Assert
        await expect(useCase.execute({ idContrato, nota: 5 }, idCliente))
            .rejects.toThrow(RecursoNaoEncontradoError)
    })

    it('deve lançar AcessoProibidoError se o cliente não for dono do contrato', async () => {
        // Arrange
        const contrato = ContratоMother.criarValido({ status: StatusContrato.CONCLUIDO })
        contratoRepoMock.buscarPorId.mockResolvedValue(contrato)

        // Act & Assert
        await expect(useCase.execute({ idContrato, nota: 5 }, new Types.ObjectId().toString()))
            .rejects.toThrow(AcessoProibidoError)
    })

    it('deve lançar OperacaoNaoPermitidaError se o contrato não estiver concluído', async () => {
        // Arrange
        const contrato = ContratоMother.criarValido({ idCliente, status: StatusContrato.EM_ANDAMENTO })
        contratoRepoMock.buscarPorId.mockResolvedValue(contrato)

        // Act & Assert
        await expect(useCase.execute({ idContrato, nota: 5 }, idCliente))
            .rejects.toThrow(OperacaoNaoPermitidaError)
    })

    it('deve lançar OperacaoNaoPermitidaError se o contrato já foi avaliado', async () => {
        // Arrange
        const contrato = ContratоMother.criarValido({ idCliente, status: StatusContrato.CONCLUIDO })
        contratoRepoMock.buscarPorId.mockResolvedValue(contrato)
        avaliacaoRepoMock.buscarPorIdContrato.mockResolvedValue(AvaliacaoMother.criarValido())

        // Act & Assert
        await expect(useCase.execute({ idContrato, nota: 5 }, idCliente))
            .rejects.toThrow(OperacaoNaoPermitidaError)
    })
})
