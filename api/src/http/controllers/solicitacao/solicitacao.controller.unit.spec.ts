import { Request, Response } from 'express';
import { Types } from 'mongoose';

import { SolicitacaoController } from "./solicitacao.controller";
import { CadastrarSolicitacaoUseCase } from "../../../domain/use-cases/solicitacao/cadastrar-solicitacao/cadastrar-solicitacao.use-case";
import { BuscarSolicitacoesClienteLogadoUseCase } from "../../../domain/use-cases/solicitacao/buscar-solicitacoes-cliente-logado/buscar-solicitacoes-cliente-logado.use-case";
import { BuscarSolicitacoesDisponiveisPrestadorUseCase } from "../../../domain/use-cases/solicitacao/buscar-solicitacoes-disponiveis-prestador/buscar-solicitacoes-disponiveis-prestador.use-case";
import { BuscarSolicitacaoPorIdUseCase } from "../../../domain/use-cases/solicitacao/buscar-solicitacao-por-id/buscar-solicitacao-por-id.use-case";
import { AtualizarSolicitacaoUseCase } from "../../../domain/use-cases/solicitacao/atualizar-solicitacao/atualizar-solicitacao.use-case";
import { SolicitacaoMother } from "../../../test-helpers/solicitacao.mother";
import { SolicitacaoMapper } from "../../mappers/solicitacao/solicitacao.mapper";
import { StatusSolicitacao } from "../../../domain/value-objects/solicitacao/status/status.vo";

describe('SolicitacaoController', () => {
    let controller: SolicitacaoController
    let cadastrarUseCaseMock: jest.Mocked<CadastrarSolicitacaoUseCase>
    let buscarClienteLogadoUseCaseMock: jest.Mocked<BuscarSolicitacoesClienteLogadoUseCase>
    let buscarDisponiveisUseCaseMock: jest.Mocked<BuscarSolicitacoesDisponiveisPrestadorUseCase>
    let buscarPorIdUseCaseMock: jest.Mocked<BuscarSolicitacaoPorIdUseCase>
    let atualizarUseCaseMock: jest.Mocked<AtualizarSolicitacaoUseCase>
    let req: Partial<Request>
    let res: Partial<Response>

    const idCliente = new Types.ObjectId().toString()
    const idPrestador = new Types.ObjectId().toString()

    beforeEach(() => {
        cadastrarUseCaseMock = { execute: jest.fn() } as any
        buscarClienteLogadoUseCaseMock = { execute: jest.fn() } as any
        buscarDisponiveisUseCaseMock = { execute: jest.fn() } as any
        buscarPorIdUseCaseMock = { execute: jest.fn() } as any
        atualizarUseCaseMock = { execute: jest.fn() } as any

        controller = new SolicitacaoController(
            cadastrarUseCaseMock,
            buscarClienteLogadoUseCaseMock,
            buscarDisponiveisUseCaseMock,
            buscarPorIdUseCaseMock,
            atualizarUseCaseMock
        )

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        }
    })

    describe('cadastrar', () => {
        it('deve retornar 201 com SolicitacaoRespostaDTO ao cadastrar', async () => {
            // Arrange
            const solicitacaoMock = SolicitacaoMother.criarValido({ idCliente })
            req = {
                user: { idCliente, idPrestador },
                body: {
                    idCategoria: solicitacaoMock.idCategoria,
                    descricao: solicitacaoMock.descricao
                }
            }
            cadastrarUseCaseMock.execute.mockResolvedValue(solicitacaoMock)
            // Act
            await controller.cadastrar(req as any, res as any)
            // Assert
            expect(res.status).toHaveBeenCalledWith(201)
            expect(res.json).toHaveBeenCalledWith(SolicitacaoMapper.paraRespostaDTO(solicitacaoMock))
        })
    })

    describe('buscarDoCliente', () => {
        it('deve retornar 200 com lista de SolicitacaoRespostaDTO', async () => {
            // Arrange
            const solicitacoesMock = [
                SolicitacaoMother.criarValido({ idCliente }),
                SolicitacaoMother.criarValido({ idCliente })
            ]
            req = { user: { idCliente } }
            buscarClienteLogadoUseCaseMock.execute.mockResolvedValue(solicitacoesMock)
            // Act
            await controller.buscarDoCliente(req as any, res as any)
            // Assert
            expect(buscarClienteLogadoUseCaseMock.execute).toHaveBeenCalledWith(idCliente)
            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith(SolicitacaoMapper.paraListaRespostaDTO(solicitacoesMock))
        })
    })

    describe('buscarDisponiveis', () => {
        it('deve retornar 200 com lista de solicitações disponíveis sem filtro de categoria', async () => {
            // Arrange
            const solicitacoesMock = [SolicitacaoMother.criarValido()]
            req = { user: { idCliente, idPrestador }, query: {} }
            buscarDisponiveisUseCaseMock.execute.mockResolvedValue(solicitacoesMock)
            // Act
            await controller.buscarDisponiveis(req as any, res as any)
            // Assert
            expect(buscarDisponiveisUseCaseMock.execute).toHaveBeenCalledWith(idPrestador, idCliente, undefined)
            expect(res.status).toHaveBeenCalledWith(200)
        })

        it('deve passar idCategoria da query para o use case', async () => {
            // Arrange
            const idCategoria = new Types.ObjectId().toString()
            req = { user: { idCliente, idPrestador }, query: { idCategoria } }
            buscarDisponiveisUseCaseMock.execute.mockResolvedValue([])
            // Act
            await controller.buscarDisponiveis(req as any, res as any)
            // Assert
            expect(buscarDisponiveisUseCaseMock.execute).toHaveBeenCalledWith(idPrestador, idCliente, idCategoria)
        })
    })

    describe('buscarPorId', () => {
        it('deve retornar 200 com SolicitacaoRespostaDTO da solicitação encontrada', async () => {
            // Arrange
            const idSolicitacao = new Types.ObjectId().toString()
            const solicitacaoMock = SolicitacaoMother.criarValido({ idCliente })
            req = {
                user: { idCliente, idPrestador },
                params: { id: idSolicitacao }
            }
            buscarPorIdUseCaseMock.execute.mockResolvedValue(solicitacaoMock)
            // Act
            await controller.buscarPorId(req as any, res as any)
            // Assert
            expect(buscarPorIdUseCaseMock.execute).toHaveBeenCalledWith(idSolicitacao, idCliente, idPrestador)
            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith(SolicitacaoMapper.paraRespostaDTO(solicitacaoMock))
        })
    })

    describe('atualizar', () => {
        it('deve retornar 200 com SolicitacaoRespostaDTO da solicitação atualizada', async () => {
            // Arrange
            const idSolicitacao = new Types.ObjectId().toString()
            const solicitacaoAtualizada = SolicitacaoMother.criarValido({ idCliente, status: StatusSolicitacao.CANCELADA })
            req = {
                user: { idCliente },
                params: { id: idSolicitacao },
                body: { status: StatusSolicitacao.CANCELADA }
            }
            atualizarUseCaseMock.execute.mockResolvedValue(solicitacaoAtualizada)
            // Act
            await controller.atualizar(req as any, res as any)
            // Assert
            expect(atualizarUseCaseMock.execute).toHaveBeenCalledWith(
                idSolicitacao,
                idCliente,
                expect.objectContaining({ status: StatusSolicitacao.CANCELADA })
            )
            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith(SolicitacaoMapper.paraRespostaDTO(solicitacaoAtualizada))
        })
    })
})
