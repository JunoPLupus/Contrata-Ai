import { Types } from "mongoose";
import { BuscarOrcamentosPrestadorLogadoUseCase } from "./buscar-orcamentos-prestador-logado.use-case";
import { OrcamentoMother } from "../../../../test-helpers/orcamento.mother";

describe('BuscarOrcamentosPrestadorLogadoUseCase', () => {
    let useCase: BuscarOrcamentosPrestadorLogadoUseCase
    let orcamentoRepoMock: ReturnType<typeof OrcamentoMother.criarRepositoryMock>

    beforeEach(() => {
        orcamentoRepoMock = OrcamentoMother.criarRepositoryMock()
        useCase = new BuscarOrcamentosPrestadorLogadoUseCase(orcamentoRepoMock)
    })

    it('deve retornar lista de orçamentos do prestador', async () => {
        // Arrange
        const idPrestador = new Types.ObjectId().toString()
        const orcamentos = [OrcamentoMother.criarValido({ idPrestador }), OrcamentoMother.criarValido({ idPrestador })]
        orcamentoRepoMock.buscarPorIdPrestador.mockResolvedValue(orcamentos)
        // Act
        const resultado = await useCase.execute(idPrestador)
        // Assert
        expect(resultado).toHaveLength(2)
        expect(orcamentoRepoMock.buscarPorIdPrestador).toHaveBeenCalledWith(idPrestador)
    })

    it('deve retornar array vazio quando prestador não tiver orçamentos', async () => {
        // Arrange
        const idPrestador = new Types.ObjectId().toString()
        orcamentoRepoMock.buscarPorIdPrestador.mockResolvedValue([])
        // Act
        const resultado = await useCase.execute(idPrestador)
        // Assert
        expect(resultado).toHaveLength(0)
    })
})
