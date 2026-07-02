import { Request, Response } from 'express';
import { Types } from 'mongoose';

import { ServicoController } from "./servico.controller";
import { CadastrarServicoUseCase } from "../../../domain/use-cases/servico/cadastrar-servico/cadastrar-servico.use-case";
import { BuscarServicosPrestadorLogadoUseCase } from "../../../domain/use-cases/servico/buscar-servicos-prestador-logado/buscar-servicos-prestador-logado.use-case";
import { BuscarServicoPorIdUseCase } from "../../../domain/use-cases/servico/buscar-servico-por-id/buscar-servico-por-id.use-case";
import { AtualizarServicoUseCase } from "../../../domain/use-cases/servico/atualizar-servico/atualizar-servico.use-case";
import { DeletarServicoUseCase } from "../../../domain/use-cases/servico/deletar-servico/deletar-servico.use-case";
import { BuscarServicosDoPrestadorUseCase } from "../../../domain/use-cases/servico/buscar-servicos-do-prestador/buscar-servicos-do-prestador.use-case";
import { ServicoMother } from "../../../test-helpers/servico.mother";
import { ServicoMapper } from "../../mappers/servico/servico.mapper";

describe('ServicoController', () => {
    let controller: ServicoController
    let cadastrarServicoUseCaseMock: jest.Mocked<CadastrarServicoUseCase>
    let buscarServicosPrestadorLogadoUseCaseMock: jest.Mocked<BuscarServicosPrestadorLogadoUseCase>
    let buscarServicoPorIdUseCaseMock: jest.Mocked<BuscarServicoPorIdUseCase>
    let atualizarServicoUseCaseMock: jest.Mocked<AtualizarServicoUseCase>
    let deletarServicoUseCaseMock: jest.Mocked<DeletarServicoUseCase>
    let buscarServicosDoPrestadorUseCaseMock: jest.Mocked<BuscarServicosDoPrestadorUseCase>
    let req: Partial<Request>
    let res: Partial<Response>

    const idPrestador = new Types.ObjectId().toString()

    beforeEach(() => {
        cadastrarServicoUseCaseMock = { execute: jest.fn() } as any
        buscarServicosPrestadorLogadoUseCaseMock = { execute: jest.fn() } as any
        buscarServicoPorIdUseCaseMock = { execute: jest.fn() } as any
        atualizarServicoUseCaseMock = { execute: jest.fn() } as any
        deletarServicoUseCaseMock = { execute: jest.fn() } as any
        buscarServicosDoPrestadorUseCaseMock = { execute: jest.fn() } as any

        controller = new ServicoController(
            cadastrarServicoUseCaseMock,
            buscarServicosPrestadorLogadoUseCaseMock,
            buscarServicoPorIdUseCaseMock,
            atualizarServicoUseCaseMock,
            deletarServicoUseCaseMock,
            buscarServicosDoPrestadorUseCaseMock
        )

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis()
        }
    })

    describe('cadastrar', () => {
        it('deve retornar 201 com ServicoRespostaDTO ao cadastrar', async () => {
            const dtoMock = ServicoMother.criarDTO({ idPrestador })
            const servicoMock = ServicoMother.criarValido(dtoMock)
            req = {
                user: { idCliente: new Types.ObjectId().toString(), idPrestador },
                body: {
                    idCategoria: dtoMock.idCategoria,
                    descricao: dtoMock.descricao,
                    precoMin: dtoMock.precoMin,
                    precoMax: dtoMock.precoMax,
                    prazoMedioDias: dtoMock.prazoMedioDias
                }
            }
            cadastrarServicoUseCaseMock.execute.mockResolvedValue(servicoMock)
            await controller.cadastrar(req as any, res as any)
            expect(res.status).toHaveBeenCalledWith(201)
            expect(res.json).toHaveBeenCalledWith(ServicoMapper.paraRespostaDTO(servicoMock))
        })
    })

    describe('buscarTodos', () => {
        it('deve retornar 200 com lista de ServicoRespostaDTO', async () => {
            const servicosMock = [
                ServicoMother.criarValido({ idPrestador }),
                ServicoMother.criarValido({ idPrestador })
            ]
            req = { user: { idCliente: new Types.ObjectId().toString(), idPrestador } }
            buscarServicosPrestadorLogadoUseCaseMock.execute.mockResolvedValue(servicosMock)
            await controller.buscarTodos(req as any, res as any)
            expect(buscarServicosPrestadorLogadoUseCaseMock.execute).toHaveBeenCalledWith(idPrestador)
            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith(ServicoMapper.paraListaRespostaDTO(servicosMock))
        })
    });

    describe('buscarPorId', () => {
        it('deve retornar 200 com ServicoRespostaDTO do servico encontrado', async () => {
            const idServico = new Types.ObjectId().toString()
            const servicoMock = ServicoMother.criarValido({ idPrestador })
            req = {
                user: { idCliente: new Types.ObjectId().toString(), idPrestador },
                params: { id: idServico }
            }
            buscarServicoPorIdUseCaseMock.execute.mockResolvedValue(servicoMock)
            await controller.buscarPorId(req as any, res as any)
            expect(buscarServicoPorIdUseCaseMock.execute).toHaveBeenCalledWith(idServico, idPrestador)
            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith(ServicoMapper.paraRespostaDTO(servicoMock))
        })
    });

    describe('atualizar', () => {
        it('deve retornar 200 com ServicoRespostaDTO do servico atualizado', async () => {
            const idServico = new Types.ObjectId().toString()
            const servicoAtualizado = ServicoMother.criarValido({ idPrestador, descricao: 'Descricao atualizada aqui' })
            req = {
                user: { idCliente: new Types.ObjectId().toString(), idPrestador },
                params: { id: idServico },
                body: { descricao: 'Descricao atualizada aqui' }
            }
            atualizarServicoUseCaseMock.execute.mockResolvedValue(servicoAtualizado)
            await controller.atualizar(req as any, res as any)
            expect(atualizarServicoUseCaseMock.execute).toHaveBeenCalledWith(
                idServico,
                idPrestador,
                expect.objectContaining({ descricao: 'Descricao atualizada aqui' })
            )
            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith(ServicoMapper.paraRespostaDTO(servicoAtualizado))
        })
    })

    describe('deletar', () => {
        it('deve retornar 204 sem corpo ao deletar', async () => {
            const idServico = new Types.ObjectId().toString()
            req = {
                user: { idCliente: new Types.ObjectId().toString(), idPrestador },
                params: { id: idServico }
            }
            deletarServicoUseCaseMock.execute.mockResolvedValue(undefined)
            await controller.deletar(req as any, res as any)
            expect(deletarServicoUseCaseMock.execute).toHaveBeenCalledWith(idServico, idPrestador)
            expect(res.status).toHaveBeenCalledWith(204)
            expect(res.send).toHaveBeenCalled()
        })
    })

    describe('buscarDoPrestador()', () => {
        it('deve retornar 200 com lista de serviços do prestador', async () => {
            // Arrange
            const servicosMock = [
                ServicoMother.criarValido({ idPrestador }),
                ServicoMother.criarValido({ idPrestador })
            ]
            req = { params: { idPrestador } }
            buscarServicosDoPrestadorUseCaseMock.execute.mockResolvedValue(servicosMock)

            // Act
            await controller.buscarDoPrestador(req as any, res as any)

            // Assert
            expect(buscarServicosDoPrestadorUseCaseMock.execute).toHaveBeenCalledWith(idPrestador)
            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith(ServicoMapper.paraListaRespostaDTO(servicosMock))
        })
    })
})
