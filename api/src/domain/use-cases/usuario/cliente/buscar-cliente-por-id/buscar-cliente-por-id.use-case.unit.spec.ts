import { BuscarClientePorIdUseCase } from "./buscar-cliente-por-id.use-case";
import { IUsuarioRepository } from "../../../../repositories/usuario.repository";
import { UsuarioMother } from "../../../../../test-helpers/usuario.mother";
import { Usuario } from "../../../../entities/usuario/usuario.entity";

describe('BuscarClientePorIdUseCase', () => {
    let buscarClientePorIdUseCase: BuscarClientePorIdUseCase
    let usuarioRepositoryMock: jest.Mocked<IUsuarioRepository>

    beforeEach(() => {
        usuarioRepositoryMock = UsuarioMother.criarRepositoryMock()
        buscarClientePorIdUseCase = new BuscarClientePorIdUseCase(usuarioRepositoryMock)
    })

    it('deve retornar o cliente quando o id existir', async () => {
        // Arrange
        const usuarioMock = UsuarioMother.criarUsuarioValido({ id: '507f1f77bcf86cd799439011' })
        usuarioRepositoryMock.buscarPorId.mockResolvedValue(usuarioMock)
        // Act
        const clienteEncontrado = await buscarClientePorIdUseCase.execute('507f1f77bcf86cd799439011')
        // Assert
        expect(usuarioRepositoryMock.buscarPorId).toHaveBeenCalledWith('507f1f77bcf86cd799439011')
        expect(clienteEncontrado).toBeInstanceOf(Usuario)
    })

    it('deve lançar RecursoNaoEncontradoError quando o id não existir', async () => {
        // Arrange
        usuarioRepositoryMock.buscarPorId.mockResolvedValue(null)
        // Act & Assert
        await expect(buscarClientePorIdUseCase.execute('507f1f77bcf86cd799439011'))
            .rejects.toEqual(expect.objectContaining({ message: 'Cliente não encontrado.' }))
    })
})
