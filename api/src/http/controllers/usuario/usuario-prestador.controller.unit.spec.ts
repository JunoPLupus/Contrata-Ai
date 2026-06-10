import { Request, Response } from 'express'

import { UsuarioPrestadorController } from "./usuario-prestador.controller";
import { CadastrarClientePrestadorUseCase } from "../../../domain/use-cases/usuario/cadastrar-cliente-prestador/cadastrar-cliente-prestador.use-case";
import { Usuario } from "../../../domain/entities/usuario/usuario.entity";
import { UsuarioMother } from "../../../test-helpers/usuario.mother";

describe('UsuarioPrestador Controller', () => {
    let controller: UsuarioPrestadorController
    let cadastrarClientePrestadorUseCaseMock: jest.Mocked<CadastrarClientePrestadorUseCase>
    let req: Partial<Request>
    let res: Partial<Response>
    let usuarioMock: Usuario

    beforeEach(async () => {
        cadastrarClientePrestadorUseCaseMock = { execute: jest.fn() } as any
        controller = new UsuarioPrestadorController(cadastrarClientePrestadorUseCaseMock)

        req = { body: UsuarioMother.criarDTOValido() }
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        }
        usuarioMock = UsuarioMother.criarUsuarioValido({ ...req.body, idPrestador: 'id-prestador-mock' })
    })

    it('deve retornar resposta com sucesso 201 e objeto usuarioPrestadorRespostaCadastroDTO ao cadastrar', async () => {
        // Arrange
        cadastrarClientePrestadorUseCaseMock.execute.mockResolvedValue(usuarioMock)
        // Act
        await controller.cadastrar(req as any, res as any)
        // Assert
        expect(res.status).toHaveBeenCalledWith(201)
        expect(res.json).toHaveBeenCalledWith({
            id: usuarioMock.id,
            idPrestador: usuarioMock.idPrestador,
            nome: usuarioMock.nome,
            email: usuarioMock.email
        })
    })
})
