import { AtivarPrestadorUseCase } from "./ativar-prestador.use-case";
import { IPrestadorRepository } from "../../../../repositories/prestador.repository";
import { PrestadorMother } from "../../../../../test-helpers/prestador.mother";

describe('AtivarPrestadorUseCase', () => {
    let ativarPrestadorUseCase: AtivarPrestadorUseCase
    let prestadorRepositoryMock: jest.Mocked<IPrestadorRepository>

    beforeEach(() => {
        prestadorRepositoryMock = PrestadorMother.criarRepositoryMock()
        ativarPrestadorUseCase = new AtivarPrestadorUseCase(prestadorRepositoryMock)
    })

    it('deve ativar um prestador existente', async () => {
        // Arrange
        const prestadorMock = PrestadorMother.criarValido({ id: '507f1f77bcf86cd799439011', ativo: false })
        prestadorRepositoryMock.buscarPorId.mockResolvedValue(prestadorMock)
        prestadorRepositoryMock.ativar.mockResolvedValue()
        // Act
        await ativarPrestadorUseCase.execute('507f1f77bcf86cd799439011')
        // Assert
        expect(prestadorRepositoryMock.ativar).toHaveBeenCalledWith('507f1f77bcf86cd799439011')
    })

    it('deve lançar RecursoNaoEncontradoError quando o id não existir', async () => {
        // Arrange
        prestadorRepositoryMock.buscarPorId.mockResolvedValue(null)
        // Act & Assert
        await expect(ativarPrestadorUseCase.execute('507f1f77bcf86cd799439011'))
            .rejects.toEqual(expect.objectContaining({ message: 'Prestador não encontrado.' }))
        expect(prestadorRepositoryMock.ativar).not.toHaveBeenCalled()
    })
})
