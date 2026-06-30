import { Request, Response } from 'express';
import { Types } from 'mongoose';

import { AvaliacaoController } from "./avaliacao.controller";
import { CadastrarAvaliacaoUseCase } from "../../../domain/use-cases/avaliacao/cadastrar-avaliacao/cadastrar-avaliacao.use-case";
import { BuscarAvaliacaoPorIdUseCase } from "../../../domain/use-cases/avaliacao/buscar-avaliacao-por-id/buscar-avaliacao-por-id.use-case";
import { BuscarAvaliacaoDoContratoUseCase } from "../../../domain/use-cases/avaliacao/buscar-avaliacao-do-contrato/buscar-avaliacao-do-contrato.use-case";
import { BuscarAvaliacoesDoClienteLogadoUseCase } from "../../../domain/use-cases/avaliacao/buscar-avaliacoes-do-cliente-logado/buscar-avaliacoes-do-cliente-logado.use-case";
import { BuscarAvaliacoesDoPrestadorUseCase } from "../../../domain/use-cases/avaliacao/buscar-avaliacoes-do-prestador/buscar-avaliacoes-do-prestador.use-case";
import { AtualizarAvaliacaoUseCase } from "../../../domain/use-cases/avaliacao/atualizar-avaliacao/atualizar-avaliacao.use-case";
import { DeletarAvaliacaoUseCase } from "../../../domain/use-cases/avaliacao/deletar-avaliacao/deletar-avaliacao.use-case";
import { AvaliacaoMother } from "../../../test-helpers/avaliacao.mother";
import { AvaliacaoMapper } from "../../mappers/avaliacao/avaliacao.mapper";

describe('Testes Unitários do Controller: Avaliação', () => {
    let controller: AvaliacaoController
    let cadastrarMock: jest.Mocked<CadastrarAvaliacaoUseCase>
    let buscarPorIdMock: jest.Mocked<BuscarAvaliacaoPorIdUseCase>
    let buscarDoContratoMock: jest.Mocked<BuscarAvaliacaoDoContratoUseCase>
    let buscarDoClienteLogadoMock: jest.Mocked<BuscarAvaliacoesDoClienteLogadoUseCase>
    let buscarDoPrestadorMock: jest.Mocked<BuscarAvaliacoesDoPrestadorUseCase>
    let atualizarMock: jest.Mocked<AtualizarAvaliacaoUseCase>
    let deletarMock: jest.Mocked<DeletarAvaliacaoUseCase>
    let req: Partial<Request>
    let res: Partial<Response>

    const idCliente = new Types.ObjectId().toString()

    beforeEach(() => {
        cadastrarMock = { execute: jest.fn() } as any
        buscarPorIdMock = { execute: jest.fn() } as any
        buscarDoContratoMock = { execute: jest.fn() } as any
        buscarDoClienteLogadoMock = { execute: jest.fn() } as any
        buscarDoPrestadorMock = { execute: jest.fn() } as any
        atualizarMock = { execute: jest.fn() } as any
        deletarMock = { execute: jest.fn() } as any

        controller = new AvaliacaoController(
            cadastrarMock,
            buscarPorIdMock,
            buscarDoContratoMock,
            buscarDoClienteLogadoMock,
            buscarDoPrestadorMock,
            atualizarMock,
            deletarMock
        )

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis(),
        }
    })

    describe('cadastrar()', () => {
        it('deve retornar 201 com AvaliacaoRespostaDTO', async () => {
            // Arrange
            const avaliacao = AvaliacaoMother.criarValido({ idCliente })
            req = { user: { idCliente }, body: { idContrato: avaliacao.idContrato, nota: 5 } }
            cadastrarMock.execute.mockResolvedValue(avaliacao)

            // Act
            await controller.cadastrar(req as any, res as any)

            // Assert
            expect(res.status).toHaveBeenCalledWith(201)
            expect(res.json).toHaveBeenCalledWith(AvaliacaoMapper.paraRespostaDTO(avaliacao))
        })
    })

    describe('buscarPorId()', () => {
        it('deve retornar 200 com AvaliacaoPublicaRespostaDTO', async () => {
            // Arrange
            const avaliacao = AvaliacaoMother.criarValido()
            req = { params: { id: avaliacao.id! } }
            buscarPorIdMock.execute.mockResolvedValue(avaliacao)

            // Act
            await controller.buscarPorId(req as any, res as any)

            // Assert
            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith(AvaliacaoMapper.paraRespostaPublicaDTO(avaliacao))
        })
    })

    describe('buscarDoContrato()', () => {
        it('deve retornar 200 com AvaliacaoPublicaRespostaDTO', async () => {
            // Arrange
            const avaliacao = AvaliacaoMother.criarValido()
            req = { params: { idContrato: avaliacao.idContrato } }
            buscarDoContratoMock.execute.mockResolvedValue(avaliacao)

            // Act
            await controller.buscarDoContrato(req as any, res as any)

            // Assert
            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith(AvaliacaoMapper.paraRespostaPublicaDTO(avaliacao))
        })
    })

    describe('buscarDoClienteLogado()', () => {
        it('deve retornar 200 com lista de AvaliacaoRespostaDTO', async () => {
            // Arrange
            const avaliacoes = [AvaliacaoMother.criarValido({ idCliente })]
            req = { user: { idCliente } }
            buscarDoClienteLogadoMock.execute.mockResolvedValue(avaliacoes)

            // Act
            await controller.buscarDoClienteLogado(req as any, res as any)

            // Assert
            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith(AvaliacaoMapper.paraListaRespostaDTO(avaliacoes))
        })
    })

    describe('buscarDoPrestador()', () => {
        it('deve retornar 200 com AvaliacoesDoPrestadorRespostaDTO', async () => {
            // Arrange
            const idPrestador = new Types.ObjectId().toString()
            const resultado = { avaliacoes: [AvaliacaoMother.criarValido({ idPrestador })], media: 5, total: 1 }
            req = { params: { idPrestador } }
            buscarDoPrestadorMock.execute.mockResolvedValue(resultado)

            // Act
            await controller.buscarDoPrestador(req as any, res as any)

            // Assert
            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith(AvaliacaoMapper.paraRespostaDoPrestadorDTO(resultado))
        })
    })

    describe('atualizar()', () => {
        it('deve retornar 200 com AvaliacaoRespostaDTO', async () => {
            // Arrange
            const avaliacao = AvaliacaoMother.criarValido({ idCliente })
            req = { user: { idCliente }, params: { id: avaliacao.id! }, body: { nota: 4 } }
            atualizarMock.execute.mockResolvedValue(avaliacao)

            // Act
            await controller.atualizar(req as any, res as any)

            // Assert
            expect(res.status).toHaveBeenCalledWith(200)
            expect(atualizarMock.execute).toHaveBeenCalledWith(avaliacao.id, idCliente, { nota: 4, comentario: undefined, anonima: undefined })
        })
    })

    describe('deletar()', () => {
        it('deve retornar 204 sem body', async () => {
            // Arrange
            const avaliacao = AvaliacaoMother.criarValido({ idCliente })
            req = { user: { idCliente }, params: { id: avaliacao.id! } }
            deletarMock.execute.mockResolvedValue(undefined)

            // Act
            await controller.deletar(req as any, res as any)

            // Assert
            expect(res.status).toHaveBeenCalledWith(204)
            expect(res.send).toHaveBeenCalled()
        })
    })
})
