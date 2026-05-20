import { Request, Response } from "express";

import { PrestadorController } from "./prestador.controller";
import { CadastrarPrestadorUseCase } from "../../../domain/use-cases/prestador/cadastrar-prestador/cadastrar-prestador.use-case";
import { PrestadorMother } from "../../../test-helpers/prestador.mother";

describe('Prestador Controller', () => {
    let controller : PrestadorController
    let cadastrarPrestadorUseCaseMock : jest.Mocked<CadastrarPrestadorUseCase>
    let req : Partial<Request>
    let res : Partial<Response>

    beforeEach( async () => {
        cadastrarPrestadorUseCaseMock = { execute: jest.fn() } as any
        controller = new PrestadorController(cadastrarPrestadorUseCaseMock)

        req = { user: PrestadorMother.criarDTO() }
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        }
    })

    it('deve retornar resposta com sucesso 201 e objeto prestadorRespostaCadastroDTO ao cadastrar', async () => {
        // Arrange
        const prestadorMock = PrestadorMother.criarValido(req.user)
        cadastrarPrestadorUseCaseMock.execute.mockResolvedValue(prestadorMock)
        // Act
        await controller.cadastrar(req as any, res as any)
        // Assert
        expect(res.status).toHaveBeenCalledWith(201)
        expect(res.json).toHaveBeenCalledWith({
            id: prestadorMock.id,
            idCliente: prestadorMock.idCliente
        })
    })
})