import bcrypt from "bcrypt";

import { CadastrarUsuarioUseCase } from "./cadastrar-usuario.use-case";
import { IUsuarioRepository } from "../../../repositories/usuario.repository";
import { Usuario } from "../../../entities/usuario/usuario.entity";
import { UsuarioMother } from "../../../../test-helpers/usuario.mother";

jest.mock('bcrypt', () => ({
    hash: jest.fn().mockResolvedValue('senha_hash_mockada'),
    compare: jest.fn()
}))

describe('CadastrarUsuarioUseCase', () => {
    let cadastrarUsuarioUseCase: CadastrarUsuarioUseCase
    let usuarioRepositoryMock : jest.Mocked<IUsuarioRepository>

    beforeEach(() => {
        usuarioRepositoryMock = {
            buscarPorEmail : jest.fn(),
            inserir : jest.fn(),
            vincularPrestador : jest.fn()
        }
        cadastrarUsuarioUseCase = new CadastrarUsuarioUseCase(usuarioRepositoryMock)
    })

    it('deve criar usuário com dados válidos', async () => {
        // Arrange
        const dtoMock = UsuarioMother.criarDTOValido()
        const usuarioMock = UsuarioMother.criarUsuarioValido()
        usuarioRepositoryMock.inserir.mockResolvedValue(usuarioMock)
        // Act
        const usuarioCadastrado = await cadastrarUsuarioUseCase.execute(dtoMock)
        // Assert
        expect(bcrypt.hash).toHaveBeenCalledWith(dtoMock.senha, 10)
        expect(usuarioRepositoryMock.buscarPorEmail).not.toHaveBeenCalled()
        expect(usuarioRepositoryMock.inserir).toHaveBeenCalledWith(
            expect.objectContaining({
                email: usuarioMock.email,
                ativo: usuarioMock.ativo,
                reputacao_flag_cancelamento: usuarioMock.reputacao_flag_cancelamento
            })
        )
        expect(usuarioCadastrado).not.toBeNull()
        expect(usuarioCadastrado).toBeInstanceOf(Usuario)
    })
})