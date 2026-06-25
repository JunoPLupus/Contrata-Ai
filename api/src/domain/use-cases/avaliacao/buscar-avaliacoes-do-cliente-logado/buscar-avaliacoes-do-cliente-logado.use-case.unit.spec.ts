import { Types } from "mongoose";
import { BuscarAvaliacoesDoClienteLogadoUseCase } from "./buscar-avaliacoes-do-cliente-logado.use-case";
import { AvaliacaoMother } from "../../../../test-helpers/avaliacao.mother";

describe('BuscarAvaliacoesDoClienteLogadoUseCase', () => {
    let useCase: BuscarAvaliacoesDoClienteLogadoUseCase
    let avaliacaoRepoMock: ReturnType<typeof AvaliacaoMother.criarRepositoryMock>

    const idCliente = new Types.ObjectId().toString()

    beforeEach(() => {
        avaliacaoRepoMock = AvaliacaoMother.criarRepositoryMock()
        useCase = new BuscarAvaliacoesDoClienteLogadoUseCase(avaliacaoRepoMock as any)
    })

    it('deve retornar lista de avaliações do cliente', async () => {
        // Arrange
        const avaliacoes = [AvaliacaoMother.criarValido({ idCliente }), AvaliacaoMother.criarValido({ idCliente })]
        avaliacaoRepoMock.buscarPorIdCliente.mockResolvedValue(avaliacoes)

        // Act
        const resultado = await useCase.execute(idCliente)

        // Assert
        expect(resultado).toHaveLength(2)
        expect(avaliacaoRepoMock.buscarPorIdCliente).toHaveBeenCalledWith(idCliente)
    })

    it('deve retornar array vazio quando cliente não tiver avaliações', async () => {
        // Arrange
        avaliacaoRepoMock.buscarPorIdCliente.mockResolvedValue([])

        // Act
        const resultado = await useCase.execute(idCliente)

        // Assert
        expect(resultado).toHaveLength(0)
    })
})
