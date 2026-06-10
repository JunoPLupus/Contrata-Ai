import { ClienteController } from "./cliente.controller";
import { CadastrarClienteUseCase } from "../../../../domain/use-cases/usuario/cliente/cadastrar-cliente/cadastrar-cliente.use-case";
import { Request, Response } from "express";
import { Usuario } from "../../../../domain/entities/usuario/usuario.entity";
import { UsuarioMother } from "../../../../test-helpers/usuario.mother";

describe('ClienteController', () => {
    let controller : ClienteController
    let cadastrarClienteUseCaseMock: jest.Mocked<CadastrarClienteUseCase>
    let req: Partial<Request>
    let res: Partial<Response>
    let usuarioMock : Usuario

    beforeEach(async () => {
        cadastrarClienteUseCaseMock = { execute: jest.fn() } as any
        controller = new ClienteController(cadastrarClienteUseCaseMock)

        req = { body: UsuarioMother.criarDTOValido() }
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        }
        usuarioMock = UsuarioMother.criarUsuarioValido(req.body)
    })

    it('deve retornar resposta com sucesso 201 e objeto usuarioRespostaCadastroDTO ao cadastrar', async () => {
        // Arrange
        cadastrarClienteUseCaseMock.execute.mockResolvedValue(usuarioMock)
        // Act
        await controller.cadastrar(req as any, res as any)
        // Assert
        expect(res.status).toHaveBeenCalledWith(201)
        expect(res.json).toHaveBeenCalledWith({
            id: usuarioMock.id,
            nome: usuarioMock.nome,
            email: usuarioMock.email
        })
    })
})