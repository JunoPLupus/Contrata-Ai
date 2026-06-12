import { InativarUsuarioUseCase } from "./inativar-usuario.use-case";
import { IUsuarioRepository } from "../../../../repositories/usuario.repository";
import { UsuarioMother } from "../../../../../test-helpers/usuario.mother";

describe('InativarUsuarioUseCase', () => {
    let inativarUsuarioUseCase: InativarUsuarioUseCase
    let usuarioRepositoryMock: jest.Mocked<IUsuarioRepository>

    beforeEach(() => {
        usuarioRepositoryMock = UsuarioMother.criarRepositoryMock()
        inativarUsuarioUseCase = new InativarUsuarioUseCase(usuarioRepositoryMock)
    })

    it('deve inativar um usuário existente', async () => {
        // Arrange
        const usuarioMock = UsuarioMother.criarUsuarioValido({ id: '507f1f77bcf86cd799439011', ativo: true })
        usuarioRepositoryMock.buscarPorId.mockResolvedValue(usuarioMock)
        usuarioRepositoryMock.atualizar.mockImplementation(async usuario => usuario)
        // Act
        await inativarUsuarioUseCase.execute('507f1f77bcf86cd799439011')
        // Assert
        expect(usuarioMock.ativo).toBe(false)
        expect(usuarioRepositoryMock.atualizar).toHaveBeenCalledWith(usuarioMock)
    })

    it('deve lançar RecursoNaoEncontradoError quando o id não existir', async () => {
        // Arrange
        usuarioRepositoryMock.buscarPorId.mockResolvedValue(null)
        // Act & Assert
        await expect(inativarUsuarioUseCase.execute('507f1f77bcf86cd799439011'))
            .rejects.toEqual(expect.objectContaining({ message: 'Usuário não encontrado.' }))
        expect(usuarioRepositoryMock.atualizar).not.toHaveBeenCalled()
    })
})
