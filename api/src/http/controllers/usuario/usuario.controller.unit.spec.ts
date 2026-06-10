import { Request, Response } from 'express'

import { UsuarioController } from "./usuario.controller";
import { CadastrarClienteUseCase } from "../../../domain/use-cases/usuario/cliente/cadastrar-cliente/cadastrar-cliente.use-case";
import { VerificarEmailUseCase } from "../../../domain/use-cases/usuario/shared/verificar-email/verificar-email.use-case";
import { Usuario } from "../../../domain/entities/usuario/usuario.entity";
import { UsuarioMother } from "../../../test-helpers/usuario.mother";

describe('UsuarioController', () => {
    let controller: UsuarioController
    let verificarEmailUseCaseMock: jest.Mocked<VerificarEmailUseCase>
    let req: Partial<Request>
    let res: Partial<Response>
    let usuarioMock : Usuario

    beforeEach( async () => {
        verificarEmailUseCaseMock = { execute: jest.fn() } as any
        controller = new UsuarioController(verificarEmailUseCaseMock)

        req = { body: UsuarioMother.criarDTOValido(), query: { email: "fulano@gmail.com" } }
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        }
        usuarioMock = UsuarioMother.criarUsuarioValido(req.body)
    })

    it('deve retornar resposta com sucesso 200 e objeto usuarioRespostaCadastroDTO ao buscar email válido', async () => {
        // Arrange
        verificarEmailUseCaseMock.execute.mockResolvedValue(usuarioMock)
        // Act
        await controller.buscarPorEmail(req as any, res as any)
        // Assert
        expect(res.status).toHaveBeenCalledWith(200)
        expect(res.json).toHaveBeenCalledWith({
            id: usuarioMock.id,
            nome: usuarioMock.nome,
            email: usuarioMock.email
        })
    })

    it('deve retornar resposta com erro 404 ao buscar email não existente no banco', async () => {
        // Arrange
        verificarEmailUseCaseMock.execute.mockResolvedValue(null)
        // Act
        await controller.buscarPorEmail(req as any, res as any)
        // Assert
        expect(res.status).toHaveBeenCalledWith(404)
    })
})