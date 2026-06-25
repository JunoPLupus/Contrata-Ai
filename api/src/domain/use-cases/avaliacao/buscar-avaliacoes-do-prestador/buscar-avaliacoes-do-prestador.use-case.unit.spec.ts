import { Types } from "mongoose";
import { BuscarAvaliacoesDoPrestadorUseCase } from "./buscar-avaliacoes-do-prestador.use-case";
import { AvaliacaoMother } from "../../../../test-helpers/avaliacao.mother";

describe('BuscarAvaliacoesDoPrestadorUseCase', () => {
    let useCase: BuscarAvaliacoesDoPrestadorUseCase
    let avaliacaoRepoMock: ReturnType<typeof AvaliacaoMother.criarRepositoryMock>

    const idPrestador = new Types.ObjectId().toString()

    beforeEach(() => {
        avaliacaoRepoMock = AvaliacaoMother.criarRepositoryMock()
        useCase = new BuscarAvaliacoesDoPrestadorUseCase(avaliacaoRepoMock as any)
    })

    it('deve retornar avaliacoes, media e total corretos', async () => {
        // Arrange
        const avaliacoes = [
            AvaliacaoMother.criarValido({ idPrestador, nota: 4 }),
            AvaliacaoMother.criarValido({ idPrestador, nota: 5 }),
            AvaliacaoMother.criarValido({ idPrestador, nota: 3 }),
        ]
        avaliacaoRepoMock.buscarPorIdPrestador.mockResolvedValue(avaliacoes)

        // Act
        const resultado = await useCase.execute(idPrestador)

        // Assert
        expect(resultado.total).toBe(3)
        expect(resultado.media).toBe(4) // (4+5+3)/3 = 4.0
        expect(resultado.avaliacoes).toHaveLength(3)
    })

    it('deve retornar media 0 e total 0 quando prestador não tiver avaliações', async () => {
        // Arrange
        avaliacaoRepoMock.buscarPorIdPrestador.mockResolvedValue([])

        // Act
        const resultado = await useCase.execute(idPrestador)

        // Assert
        expect(resultado.total).toBe(0)
        expect(resultado.media).toBe(0)
        expect(resultado.avaliacoes).toHaveLength(0)
    })

    it('deve arredondar a média para 1 casa decimal', async () => {
        // Arrange
        const avaliacoes = [
            AvaliacaoMother.criarValido({ idPrestador, nota: 4 }),
            AvaliacaoMother.criarValido({ idPrestador, nota: 5 }),
        ]
        avaliacaoRepoMock.buscarPorIdPrestador.mockResolvedValue(avaliacoes)

        // Act
        const resultado = await useCase.execute(idPrestador)

        // Assert
        expect(resultado.media).toBe(4.5) // (4+5)/2 = 4.5
    })
})
