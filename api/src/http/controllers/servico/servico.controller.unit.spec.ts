import { Request, Response } from 'express';
import { Types } from 'mongoose';

import { ServicoController } from "./servico.controller";
import { CadastrarServicoUseCase } from "../../../domain/use-cases/servico/cadastrar-servico/cadastrar-servico.use-case";
import { ServicoMother } from "../../../test-helpers/servico.mother";

describe('ServicoController', () => {
    let controller: ServicoController
    let cadastrarServicoUseCaseMock: jest.Mocked<CadastrarServicoUseCase>
    let req: Partial<Request>
    let res: Partial<Response>

    beforeEach(() => {
        cadastrarServicoUseCaseMock = { execute: jest.fn() } as any
        controller = new ServicoController(cadastrarServicoUseCaseMock)

        const dtoMock = ServicoMother.criarDTO()
        req = {
            user: { idCliente: new Types.ObjectId().toString(), idPrestador: dtoMock.idPrestador },
            body: {
                idCategoria: dtoMock.idCategoria,
                descricao: dtoMock.descricao,
                precoMin: dtoMock.precoMin,
                precoMax: dtoMock.precoMax,
                prazoMedioDias: dtoMock.prazoMedioDias
            }
        }
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        }
    })

    it('deve retornar resposta com sucesso 201 e objeto servicoRespostaCadastroDTO ao cadastrar', async () => {
        // Arrange
        const servicoMock = ServicoMother.criarValido({ idPrestador: req.user!.idPrestador, ...req.body })
        cadastrarServicoUseCaseMock.execute.mockResolvedValue(servicoMock)
        // Act
        await controller.cadastrar(req as any, res as any)
        // Assert
        expect(res.status).toHaveBeenCalledWith(201)
        expect(res.json).toHaveBeenCalledWith({
            id: servicoMock.id,
            idCategoria: servicoMock.idCategoria,
            descricao: servicoMock.descricao,
            precoMin: servicoMock.precoMin,
            precoMax: servicoMock.precoMax,
            prazoMedioDias: servicoMock.prazoMedioDias,
            ativo: servicoMock.ativo
        })
    })
})
