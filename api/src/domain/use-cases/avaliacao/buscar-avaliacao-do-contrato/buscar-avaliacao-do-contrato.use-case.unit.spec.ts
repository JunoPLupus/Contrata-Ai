import { Types } from "mongoose";
import { BuscarAvaliacaoDoContratoUseCase } from "./buscar-avaliacao-do-contrato.use-case";
import { AvaliacaoMother } from "../../../../test-helpers/avaliacao.mother";
import { RecursoNaoEncontradoError } from "../../../errors/recurso-nao-encontrado.error";

describe('BuscarAvaliacaoDoContratoUseCase', () => {
    let useCase: BuscarAvaliacaoDoContratoUseCase
    let avaliacaoRepoMock: ReturnType<typeof AvaliacaoMother.criarRepositoryMock>

    beforeEach(() => {
        avaliacaoRepoMock = AvaliacaoMother.criarRepositoryMock()
        useCase = new BuscarAvaliacaoDoContratoUseCase(avaliacaoRepoMock as any)
    })

    it('deve retornar a avaliação do contrato quando existir', async () => {
        // Arrange
        const avaliacao = AvaliacaoMother.criarValido()
        avaliacaoRepoMock.buscarPorIdContrato.mockResolvedValue(avaliacao)

        // Act
        const resultado = await useCase.execute(new Types.ObjectId().toString())

        // Assert
        expect(resultado).toBe(avaliacao)
    })

    it('deve lançar RecursoNaoEncontradoError se o contrato não tiver avaliação', async () => {
        // Arrange
        avaliacaoRepoMock.buscarPorIdContrato.mockResolvedValue(null)

        // Act & Assert
        await expect(useCase.execute(new Types.ObjectId().toString()))
            .rejects.toThrow(RecursoNaoEncontradoError)
    })
})
