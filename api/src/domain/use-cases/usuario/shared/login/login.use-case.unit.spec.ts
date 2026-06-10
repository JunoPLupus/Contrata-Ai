import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';

import { LoginUseCase } from "./login.use-case";
import { IUsuarioRepository } from "../../../../repositories/usuario.repository";
import { UsuarioMother } from "../../../../../test-helpers/usuario.mother";
import { Usuario } from "../../../../entities/usuario/usuario.entity";
import { UsuarioLoginDTO } from "../../../../dto/usuario/usuario-login.dto";

jest.mock('bcrypt', () => ({
    hash: jest.fn().mockResolvedValue('senha_hash_mockada'),
    compare: jest.fn()
}))

jest.mock('jsonwebtoken', () => ({
    sign: jest.fn().mockReturnValue('token_mockado')
}))

describe('Login UseCase', () => {
    let loginUseCase: LoginUseCase
    let usuarioRepositoryMock: jest.Mocked<IUsuarioRepository>
    let usuarioMock: Usuario
    let usuarioDTOMock : UsuarioLoginDTO

    beforeEach(()=>{
        jest.clearAllMocks()
        usuarioRepositoryMock = UsuarioMother.criarRepositoryMock()
        loginUseCase = new LoginUseCase(usuarioRepositoryMock)
        usuarioMock = UsuarioMother.criarUsuarioValido()
        usuarioDTOMock = { email: usuarioMock.email, senha: usuarioMock.senha }
    })

    it('deve retornar um token jwt válido após verificar credenciais corretas', async () => {
        // Arrange
        usuarioRepositoryMock.buscarPorEmail.mockResolvedValue(usuarioMock)
        jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never)
        // Act
        const tokenGerado = await loginUseCase.execute(usuarioDTOMock)
        // Assert
        expect(bcrypt.compare).toHaveBeenCalledWith(usuarioDTOMock.senha, usuarioMock.senha)
        expect(jwt.sign).toHaveBeenCalled()
        expect(tokenGerado).toBeTruthy()
        expect(tokenGerado).toBe('token_mockado')
    })

    it('deve lançar erro CredenciaisInvalidasError caso o usuário não tenha sido encontrado', async () => {
        // Arrange
        usuarioRepositoryMock.buscarPorEmail.mockResolvedValue(null)
        // Act & Assert
        await expect(loginUseCase.execute(usuarioDTOMock))
            .rejects.toThrow(
                expect.objectContaining({
                    message : "Credenciais inválidas! Verifique suas credenciais e tente novamente."
                })
            )
        expect(bcrypt.compare).not.toHaveBeenCalled()
        expect(jwt.sign).not.toHaveBeenCalled()
    })

    it('deve lançar erro CredenciaisInvalidasError caso as credenciais sejam inválidas', async () => {
        // Arrange
        usuarioRepositoryMock.buscarPorEmail.mockResolvedValue(usuarioMock)
        jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never)
        // Act & Assert
        await expect(loginUseCase.execute(usuarioDTOMock))
            .rejects.toThrow(
                expect.objectContaining({
                    message : "Credenciais inválidas! Verifique suas credenciais e tente novamente."
                })
            )
        expect(bcrypt.compare).toHaveBeenCalledWith(usuarioDTOMock.senha, usuarioMock.senha)
        expect(jwt.sign).not.toHaveBeenCalled()
    })

    it('deve incluir idPrestador no payload quando o usuario for prestador', async () => {
        // Arrange
        const idPrestadorMock = 'id-prestador-mock'
        const usuarioPrestadorMock = UsuarioMother.criarUsuarioValido({ idPrestador: idPrestadorMock })
        usuarioRepositoryMock.buscarPorEmail.mockResolvedValue(usuarioPrestadorMock)
        jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never)
        // Act
        await loginUseCase.execute(usuarioDTOMock)
        // Assert
        expect(jwt.sign).toHaveBeenCalledWith(
            expect.objectContaining({ idPrestador: idPrestadorMock }),
            expect.anything(),
            expect.anything()
        )
    })
})
