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
import { Papel } from "../../../domain/value-objects/shared/papel/papel.vo";

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
    const idPrestador = new Types.ObjectId().toString()

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
        it('deve retornar 201 com a visão completa, incluindo o autor', async () => {
            // Arrange
            const avaliacao = AvaliacaoMother.criarValido({
                idCliente, idPrestador, autor: Papel.PRESTADOR, nota: 2, comentario: 'Não pagou', anonima: true
            })
            req = { user: { idCliente, idPrestador }, body: { idContrato: avaliacao.idContrato, nota: 2 } }
            cadastrarMock.execute.mockResolvedValue(avaliacao)

            // Act
            await controller.cadastrar(req as any, res as any)

            // Assert
            expect(res.status).toHaveBeenCalledWith(201)
            expect(res.json).toHaveBeenCalledWith({
                id: avaliacao.id,
                idContrato: avaliacao.idContrato,
                idCliente,
                idPrestador,
                autor: 'prestador',
                nota: 2,
                comentario: 'Não pagou',
                anonima: true,
                dataCriacao: avaliacao.dataCriacao,
                dataAtualizacao: undefined,
            })
        })

        it('deve repassar o body e os dois perfis do token ao use-case', async () => {
            // Arrange
            const avaliacao = AvaliacaoMother.criarValido()
            const body = { idContrato: avaliacao.idContrato, nota: 4, comentario: 'Bom', anonima: false, autor: 'cliente' }
            req = { user: { idCliente, idPrestador }, body }
            cadastrarMock.execute.mockResolvedValue(avaliacao)

            // Act
            await controller.cadastrar(req as any, res as any)

            // Assert — `autor` do body é ignorado: é deduzido pelo use-case
            expect(cadastrarMock.execute).toHaveBeenCalledWith(
                { idContrato: avaliacao.idContrato, nota: 4, comentario: 'Bom', anonima: false },
                idCliente,
                idPrestador
            )
        })
    })

    describe('buscarPorId()', () => {
        it('deve retornar 200 com a visão pública', async () => {
            // Arrange
            const avaliacao = AvaliacaoMother.criarValido({ idCliente, idPrestador, nota: 3 })
            req = { params: { id: avaliacao.id! } }
            buscarPorIdMock.execute.mockResolvedValue(avaliacao)

            // Act
            await controller.buscarPorId(req as any, res as any)

            // Assert
            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                id: avaliacao.id, idCliente, idPrestador, autor: 'cliente', nota: 3, anonima: false,
            }))
        })

        it('deve ocultar o id do cliente quando o cliente for o autor e a avaliação for anônima', async () => {
            // Arrange
            const avaliacao = AvaliacaoMother.criarValido({ idCliente, idPrestador, autor: Papel.CLIENTE, anonima: true })
            req = { params: { id: avaliacao.id! } }
            buscarPorIdMock.execute.mockResolvedValue(avaliacao)

            // Act
            await controller.buscarPorId(req as any, res as any)

            // Assert
            const corpo = (res.json as jest.Mock).mock.calls[0][0]
            expect(corpo.idCliente).toBeUndefined()
            expect(corpo.idPrestador).toBe(idPrestador)
        })

        it('deve ocultar o id do prestador quando o prestador for o autor e a avaliação for anônima', async () => {
            // Arrange
            const avaliacao = AvaliacaoMother.criarValido({ idCliente, idPrestador, autor: Papel.PRESTADOR, anonima: true })
            req = { params: { id: avaliacao.id! } }
            buscarPorIdMock.execute.mockResolvedValue(avaliacao)

            // Act
            await controller.buscarPorId(req as any, res as any)

            // Assert
            const corpo = (res.json as jest.Mock).mock.calls[0][0]
            expect(corpo.idPrestador).toBeUndefined()
            expect(corpo.idCliente).toBe(idCliente)
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
            expect(atualizarMock.execute).toHaveBeenCalledWith(avaliacao.id, { nota: 4, comentario: undefined, anonima: undefined }, idCliente, undefined)
        })

        it('deve repassar o idPrestador do token ao use-case', async () => {
            // Arrange
            const avaliacao = AvaliacaoMother.criarValido({ idPrestador, autor: Papel.PRESTADOR })
            req = { user: { idCliente, idPrestador }, params: { id: avaliacao.id! }, body: { anonima: true } }
            atualizarMock.execute.mockResolvedValue(avaliacao)

            // Act
            await controller.atualizar(req as any, res as any)

            // Assert
            expect(atualizarMock.execute).toHaveBeenCalledWith(avaliacao.id, { nota: undefined, comentario: undefined, anonima: true }, idCliente, idPrestador)
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
            expect(deletarMock.execute).toHaveBeenCalledWith(avaliacao.id, idCliente, undefined)
        })

        it('deve repassar o idPrestador do token ao use-case', async () => {
            // Arrange
            const avaliacao = AvaliacaoMother.criarValido()
            req = { user: { idCliente, idPrestador }, params: { id: avaliacao.id! } }
            deletarMock.execute.mockResolvedValue(undefined)

            // Act
            await controller.deletar(req as any, res as any)

            // Assert
            expect(deletarMock.execute).toHaveBeenCalledWith(avaliacao.id, idCliente, idPrestador)
        })
    })
})
