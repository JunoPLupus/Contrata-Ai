import { BuscarPrestadorPorIdUseCase } from "./buscar-prestador-por-id.use-case";
import { IPrestadorRepository } from "../../../../repositories/prestador.repository";
import { PrestadorMother } from "../../../../../test-helpers/prestador.mother";
import { Prestador } from "../../../../entities/prestador/prestador.entity";

describe('BuscarPrestadorPorIdUseCase', () => {
    let buscarPrestadorPorIdUseCase: BuscarPrestadorPorIdUseCase
    let prestadorRepositoryMock: jest.Mocked<IPrestadorRepository>

    beforeEach(() => {
        prestadorRepositoryMock = PrestadorMother.criarRepositoryMock()
        buscarPrestadorPorIdUseCase = new BuscarPrestadorPorIdUseCase(prestadorRepositoryMock)
    })

    it('deve retornar o prestador quando o id existir', async () => {
        // Arrange
        const prestadorMock = PrestadorMother.criarValido({ id: '507f1f77bcf86cd799439011' })
        prestadorRepositoryMock.buscarPorId.mockResolvedValue(prestadorMock)
        // Act
        const prestadorEncontrado = await buscarPrestadorPorIdUseCase.execute('507f1f77bcf86cd799439011')
        // Assert
        expect(prestadorRepositoryMock.buscarPorId).toHaveBeenCalledWith('507f1f77bcf86cd799439011')
        expect(prestadorEncontrado).toBeInstanceOf(Prestador)
    })

    it('deve lançar RecursoNaoEncontradoError quando o id não existir', async () => {
        // Arrange
        prestadorRepositoryMock.buscarPorId.mockResolvedValue(null)
        // Act & Assert
        await expect(buscarPrestadorPorIdUseCase.execute('507f1f77bcf86cd799439011'))
            .rejects.toEqual(expect.objectContaining({ message: 'Prestador não encontrado.' }))
    })
})
