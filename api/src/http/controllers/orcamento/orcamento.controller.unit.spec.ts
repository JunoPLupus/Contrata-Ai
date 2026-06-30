import { Request, Response } from 'express';
import { Types } from 'mongoose';

import { OrcamentoController } from "./orcamento.controller";
import { CadastrarOrcamentoUseCase } from "../../../domain/use-cases/orcamento/cadastrar-orcamento/cadastrar-orcamento.use-case";
import { BuscarOrcamentosPrestadorLogadoUseCase } from "../../../domain/use-cases/orcamento/buscar-orcamentos-prestador-logado/buscar-orcamentos-prestador-logado.use-case";
import { BuscarOrcamentoPorIdUseCase } from "../../../domain/use-cases/orcamento/buscar-orcamento-por-id/buscar-orcamento-por-id.use-case";
import { AtualizarOrcamentoUseCase } from "../../../domain/use-cases/orcamento/atualizar-orcamento/atualizar-orcamento.use-case";
import { AceitarOrcamentoUseCase } from "../../../domain/use-cases/orcamento/aceitar-orcamento/aceitar-orcamento.use-case";
import { BuscarOrcamentosDaSolicitacaoUseCase } from "../../../domain/use-cases/orcamento/buscar-orcamentos-da-solicitacao/buscar-orcamentos-da-solicitacao.use-case";
import { OrcamentoMother } from "../../../test-helpers/orcamento.mother";
import { OrcamentoMapper } from "../../mappers/orcamento/orcamento.mapper";
import { StatusOrcamento } from "../../../domain/value-objects/orcamento/status/status.vo";

describe('OrcamentoController', () => {
    let controller: OrcamentoController
    let cadastrarUseCaseMock: jest.Mocked<CadastrarOrcamentoUseCase>
    let buscarPrestadorLogadoUseCaseMock: jest.Mocked<BuscarOrcamentosPrestadorLogadoUseCase>
    let buscarPorIdUseCaseMock: jest.Mocked<BuscarOrcamentoPorIdUseCase>
    let atualizarUseCaseMock: jest.Mocked<AtualizarOrcamentoUseCase>
    let aceitarUseCaseMock: jest.Mocked<AceitarOrcamentoUseCase>
    let buscarDaSolicitacaoUseCaseMock: jest.Mocked<BuscarOrcamentosDaSolicitacaoUseCase>
    let req: Partial<Request>
    let res: Partial<Response>

    const idCliente = new Types.ObjectId().toString()
    const idPrestador = new Types.ObjectId().toString()

    beforeEach(() => {
        cadastrarUseCaseMock = { execute: jest.fn() } as any
        buscarPrestadorLogadoUseCaseMock = { execute: jest.fn() } as any
        buscarPorIdUseCaseMock = { execute: jest.fn() } as any
        atualizarUseCaseMock = { execute: jest.fn() } as any
        aceitarUseCaseMock = { execute: jest.fn() } as any
        buscarDaSolicitacaoUseCaseMock = { execute: jest.fn() } as any

        controller = new OrcamentoController(
            cadastrarUseCaseMock,
            buscarPrestadorLogadoUseCaseMock,
            buscarPorIdUseCaseMock,
            atualizarUseCaseMock,
            aceitarUseCaseMock,
            buscarDaSolicitacaoUseCaseMock
        )

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        }
    })

    describe('cadastrar', () => {
        it('deve retornar 201 com OrcamentoRespostaDTO ao cadastrar', async () => {
            // Arrange
            const orcamentoMock = OrcamentoMother.criarValido({ idPrestador })
            req = {
                user: { idCliente, idPrestador },
                body: { idSolicitacao: orcamentoMock.idSolicitacao, valor: orcamentoMock.valor }
            }
            cadastrarUseCaseMock.execute.mockResolvedValue(orcamentoMock)
            // Act
            await controller.cadastrar(req as any, res as any)
            // Assert
            expect(cadastrarUseCaseMock.execute).toHaveBeenCalledWith(
                expect.objectContaining({ idClienteDoPrestador: idCliente })
            )
            expect(res.status).toHaveBeenCalledWith(201)
            expect(res.json).toHaveBeenCalledWith(OrcamentoMapper.paraRespostaDTO(orcamentoMock))
        })
    })

    describe('buscarDoPrestador', () => {
        it('deve retornar 200 com lista de OrcamentoRespostaDTO', async () => {
            // Arrange
            const orcamentos = [OrcamentoMother.criarValido({ idPrestador }), OrcamentoMother.criarValido({ idPrestador })]
            req = { user: { idCliente, idPrestador } }
            buscarPrestadorLogadoUseCaseMock.execute.mockResolvedValue(orcamentos)
            // Act
            await controller.buscarDoPrestador(req as any, res as any)
            // Assert
            expect(buscarPrestadorLogadoUseCaseMock.execute).toHaveBeenCalledWith(idPrestador)
            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith(OrcamentoMapper.paraListaRespostaDTO(orcamentos))
        })
    })

    describe('buscarPorId', () => {

        it('deve retornar 200 com OrcamentoRespostaDTO do orçamento encontrado', async () => {
            // Arrange
            const idOrcamento = new Types.ObjectId().toString()
            const orcamentoMock = OrcamentoMother.criarValido({ idPrestador })
            req = {
                user: { idCliente, idPrestador },
                params: { id: idOrcamento }
            }
            buscarPorIdUseCaseMock.execute.mockResolvedValue(orcamentoMock)
            // Act
            await controller.buscarPorId(req as any, res as any)
            // Assert
            expect(buscarPorIdUseCaseMock.execute).toHaveBeenCalledWith(idOrcamento, idCliente, idPrestador)
            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith(OrcamentoMapper.paraRespostaDTO(orcamentoMock))
        })
    })

    describe('atualizar', () => {
        it('deve retornar 200 com OrcamentoRespostaDTO do orçamento atualizado', async () => {
            // Arrange
            const idOrcamento = new Types.ObjectId().toString()
            const orcamentoAtualizado = OrcamentoMother.criarValido({ idPrestador, status: StatusOrcamento.CANCELADO })
            req = {
                user: { idCliente, idPrestador },
                params: { id: idOrcamento },
                body: { status: StatusOrcamento.CANCELADO }
            }
            atualizarUseCaseMock.execute.mockResolvedValue(orcamentoAtualizado)
            // Act
            await controller.atualizar(req as any, res as any)
            // Assert
            expect(atualizarUseCaseMock.execute).toHaveBeenCalledWith(
                idOrcamento,
                idPrestador,
                expect.objectContaining({ status: StatusOrcamento.CANCELADO })
            )
            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith(OrcamentoMapper.paraRespostaDTO(orcamentoAtualizado))
        })
    })

    describe('buscarDaSolicitacao', () => {
        it('deve retornar 200 com lista de OrcamentoRespostaDTO dos orçamentos pendentes', async () => {
            // Arrange
            const idSolicitacao = new Types.ObjectId().toString()
            const orcamentos = [OrcamentoMother.criarValido(), OrcamentoMother.criarValido()]
            req = {
                user: { idCliente },
                params: { id: idSolicitacao }
            }
            buscarDaSolicitacaoUseCaseMock.execute.mockResolvedValue(orcamentos)
            // Act
            await controller.buscarDaSolicitacao(req as any, res as any)
            // Assert
            expect(buscarDaSolicitacaoUseCaseMock.execute).toHaveBeenCalledWith(idSolicitacao, idCliente)
            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith(OrcamentoMapper.paraListaRespostaDTO(orcamentos))
        })
    })

    describe('aceitar', () => {
        it('deve retornar 200 com OrcamentoRespostaDTO do orçamento aceito', async () => {
            // Arrange
            const idOrcamento = new Types.ObjectId().toString()
            const orcamentoAceito = OrcamentoMother.criarValido({ status: StatusOrcamento.ACEITO })
            req = {
                user: { idCliente },
                params: { id: idOrcamento }
            }
            aceitarUseCaseMock.execute.mockResolvedValue(orcamentoAceito)
            // Act
            await controller.aceitar(req as any, res as any)
            // Assert
            expect(aceitarUseCaseMock.execute).toHaveBeenCalledWith(idOrcamento, idCliente)
            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith(OrcamentoMapper.paraRespostaDTO(orcamentoAceito))
        })
    })
})
