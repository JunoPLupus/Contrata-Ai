import { Request, Response } from "express";

import { AuthController } from "./auth.controller";
import { LoginUseCase } from "../../../domain/use-cases/usuario/login/login.use-case";
import { UsuarioMother } from "../../../test-helpers/usuario.mother";
import { UsuarioLoginDTO } from "../../../domain/dto/usuario/usuario-login.dto";

describe('Auth Controller', () => {

    let controller: AuthController
    let loginUseCaseMock : jest.Mocked<LoginUseCase>
    let req: Partial<Request>
    let res: Partial<Response>

    beforeEach(async () => {
        loginUseCaseMock = { execute: jest.fn() } as any
        controller = new AuthController(loginUseCaseMock)

        const usuarioMock = UsuarioMother.criarUsuarioValido()
        const usuarioDTOMock : UsuarioLoginDTO = {
            email : usuarioMock.email,
            senha : usuarioMock.senha
        }
        req = { body: usuarioDTOMock }
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        }
    })

    it('deve retornar 200 e token JWT quando login for efetuado com sucesso', async () => {
        // Arrange
        const tokenJWT = 'token_jwt'
        loginUseCaseMock.execute.mockResolvedValue(tokenJWT)
        // Act
        await controller.login(req as any, res as any)
        // Assert
        expect(res.status).toHaveBeenCalledWith(200)
        expect(res.json).toHaveBeenCalledWith(tokenJWT)
    })
})