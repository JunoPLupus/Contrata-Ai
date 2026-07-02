import { Types } from "mongoose";
import { BuscarAvaliacaoPorIdUseCase } from "./buscar-avaliacao-por-id.use-case";
import { AvaliacaoMother } from "../../../../test-helpers/avaliacao.mother";
import { RecursoNaoEncontradoError } from "../../../errors/recurso-nao-encontrado.error";

describe('BuscarAvaliacaoPorIdUseCase', () => {
    let useCase: BuscarAvaliacaoPorIdUseCase
    let avaliacaoRepoMock: ReturnType<typeof AvaliacaoMother.criarRepositoryMock>

    beforeEach(() => {
        avaliacaoRepoMock = AvaliacaoMother.criarRepositoryMock()
        useCase = new BuscarAvaliacaoPorIdUseCase(avaliacaoRepoMock as any)
    })

    it('deve retornar a avaliação quando encontrada', async () => {
        // Arrange
        const avaliacao = AvaliacaoMother.criarValido()
        avaliacaoRepoMock.buscarPorId.mockResolvedValue(avaliacao)

        // Act
        const resultado = await useCase.execute(avaliacao.id!)

        // Assert
        expect(resultado).toBe(avaliacao)
    })

    it('deve lançar RecursoNaoEncontradoError se a avaliação não existir', async () => {
        // Arrange
        avaliacaoRepoMock.buscarPorId.mockResolvedValue(null)

        // Act & Assert
        await expect(useCase.execute(new Types.ObjectId().toString()))
            .rejects.toThrow(RecursoNaoEncontradoError)
    })
})
