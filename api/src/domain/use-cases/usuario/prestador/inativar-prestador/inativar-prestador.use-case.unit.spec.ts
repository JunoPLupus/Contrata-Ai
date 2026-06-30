import { InativarPrestadorUseCase } from "./inativar-prestador.use-case";
import { IPrestadorRepository } from "../../../../repositories/prestador.repository";
import { PrestadorMother } from "../../../../../test-helpers/prestador.mother";

describe('InativarPrestadorUseCase', () => {
    let inativarPrestadorUseCase: InativarPrestadorUseCase
    let prestadorRepositoryMock: jest.Mocked<IPrestadorRepository>

    beforeEach(() => {
        prestadorRepositoryMock = PrestadorMother.criarRepositoryMock()
        inativarPrestadorUseCase = new InativarPrestadorUseCase(prestadorRepositoryMock)
    })

    it('deve inativar um prestador existente', async () => {
        // Arrange
        const prestadorMock = PrestadorMother.criarValido({ id: '507f1f77bcf86cd799439011' })
        prestadorRepositoryMock.buscarPorId.mockResolvedValue(prestadorMock)
        prestadorRepositoryMock.inativar.mockResolvedValue()
        // Act
        await inativarPrestadorUseCase.execute('507f1f77bcf86cd799439011')
        // Assert
        expect(prestadorRepositoryMock.inativar).toHaveBeenCalledWith('507f1f77bcf86cd799439011')
    })

    it('deve lançar RecursoNaoEncontradoError quando o id não existir', async () => {
        // Arrange
        prestadorRepositoryMock.buscarPorId.mockResolvedValue(null)
        // Act & Assert
        await expect(inativarPrestadorUseCase.execute('507f1f77bcf86cd799439011'))
            .rejects.toEqual(expect.objectContaining({ message: 'Prestador não encontrado.' }))
        expect(prestadorRepositoryMock.inativar).not.toHaveBeenCalled()
    })
})
