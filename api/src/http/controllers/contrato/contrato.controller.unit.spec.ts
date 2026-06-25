import { Request, Response } from 'express';
import { Types } from 'mongoose';

import { ContratoController } from "./contrato.controller";
import { BuscarContratosDoUsuarioUseCase } from "../../../domain/use-cases/contrato/buscar-contratos-do-usuario/buscar-contratos-do-usuario.use-case";
import { BuscarContratoPorIdUseCase } from "../../../domain/use-cases/contrato/buscar-contrato-por-id/buscar-contrato-por-id.use-case";
import { AtualizarContratoUseCase } from "../../../domain/use-cases/contrato/atualizar-contrato/atualizar-contrato.use-case";
import { AtualizarStatusContratoUseCase } from "../../../domain/use-cases/contrato/atualizar-status-contrato/atualizar-status-contrato.use-case";
import { ConcluirContratoUseCase } from "../../../domain/use-cases/contrato/concluir-contrato/concluir-contrato.use-case";
import { CancelarContratoUseCase } from "../../../domain/use-cases/contrato/cancelar-contrato/cancelar-contrato.use-case";
import { ContratоMother } from "../../../test-helpers/contrato.mother";
import { ContratoMapper } from "../../mappers/contrato/contrato.mapper";
import { StatusContrato } from "../../../domain/value-objects/contrato/status/status.vo";

describe('Testes Unitários do Controller: Contrato', () => {
    let controller: ContratoController
    let buscarDoUsuarioMock: jest.Mocked<BuscarContratosDoUsuarioUseCase>
    let buscarPorIdMock: jest.Mocked<BuscarContratoPorIdUseCase>
    let atualizarMock: jest.Mocked<AtualizarContratoUseCase>
    let atualizarStatusMock: jest.Mocked<AtualizarStatusContratoUseCase>
    let concluirMock: jest.Mocked<ConcluirContratoUseCase>
    let cancelarMock: jest.Mocked<CancelarContratoUseCase>
    let req: Partial<Request>
    let res: Partial<Response>

    const idCliente = new Types.ObjectId().toString()
    const idPrestador = new Types.ObjectId().toString()

    beforeEach(() => {
        buscarDoUsuarioMock = { execute: jest.fn() } as any
        buscarPorIdMock = { execute: jest.fn() } as any
        atualizarMock = { execute: jest.fn() } as any
        atualizarStatusMock = { execute: jest.fn() } as any
        concluirMock = { execute: jest.fn() } as any
        cancelarMock = { execute: jest.fn() } as any

        controller = new ContratoController(
            buscarDoUsuarioMock,
            buscarPorIdMock,
            atualizarMock,
            atualizarStatusMock,
            concluirMock,
            cancelarMock
        )

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        }
    })

    describe('buscarDoUsuario()', () => {
        it('deve retornar 200 com lista de ContratoRespostaDTO', async () => {
            // Arrange
            const contratos = [ContratоMother.criarValido({ idCliente }), ContratоMother.criarValido({ idCliente })]
            req = { user: { idCliente, idPrestador } }
            buscarDoUsuarioMock.execute.mockResolvedValue(contratos)
            // Act
            await controller.buscarDoUsuario(req as any, res as any)
            // Assert
            expect(buscarDoUsuarioMock.execute).toHaveBeenCalledWith(idCliente, idPrestador)
            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith(ContratoMapper.paraListaRespostaDTO(contratos))
        })
    })

    describe('buscarPorId()', () => {
        it('deve retornar 200 com ContratoRespostaDTO', async () => {
            // Arrange
            const idContrato = new Types.ObjectId().toString()
            const contrato = ContratоMother.criarValido({ idCliente })
            req = { user: { idCliente, idPrestador }, params: { id: idContrato } }
            buscarPorIdMock.execute.mockResolvedValue(contrato)
            // Act
            await controller.buscarPorId(req as any, res as any)
            // Assert
            expect(buscarPorIdMock.execute).toHaveBeenCalledWith(idContrato, idCliente, idPrestador)
            expect(res.status).toHaveBeenCalledWith(200)
        })
    })

    describe('atualizar()', () => {
        it('deve retornar 200 com ContratoRespostaDTO atualizado', async () => {
            // Arrange
            const idContrato = new Types.ObjectId().toString()
            const contrato = ContratоMother.criarValido({ idPrestador })
            req = {
                user: { idCliente, idPrestador },
                params: { id: idContrato },
                body: { prazoEstimado: new Date().toISOString() }
            }
            atualizarMock.execute.mockResolvedValue(contrato)
            // Act
            await controller.atualizar(req as any, res as any)
            // Assert
            expect(atualizarMock.execute).toHaveBeenCalledWith(idContrato, idPrestador, expect.any(Object))
            expect(res.status).toHaveBeenCalledWith(200)
        })
    })

    describe('atualizarStatus()', () => {
        it('deve retornar 200 com ContratoRespostaDTO com novo status', async () => {
            // Arrange
            const idContrato = new Types.ObjectId().toString()
            const contrato = ContratоMother.criarValido({ idPrestador, status: StatusContrato.EM_ANDAMENTO })
            req = {
                user: { idCliente, idPrestador },
                params: { id: idContrato },
                body: { status: StatusContrato.EM_ANDAMENTO }
            }
            atualizarStatusMock.execute.mockResolvedValue(contrato)
            // Act
            await controller.atualizarStatus(req as any, res as any)
            // Assert
            expect(atualizarStatusMock.execute).toHaveBeenCalledWith(idContrato, idPrestador, { status: StatusContrato.EM_ANDAMENTO })
            expect(res.status).toHaveBeenCalledWith(200)
        })
    })

    describe('concluir()', () => {
        it('deve retornar 200 com ContratoRespostaDTO concluído', async () => {
            // Arrange
            const idContrato = new Types.ObjectId().toString()
            const contrato = ContratоMother.criarValido({ idCliente, status: StatusContrato.CONCLUIDO })
            req = { user: { idCliente, idPrestador }, params: { id: idContrato } }
            concluirMock.execute.mockResolvedValue(contrato)
            // Act
            await controller.concluir(req as any, res as any)
            // Assert
            expect(concluirMock.execute).toHaveBeenCalledWith(idContrato, idCliente, idPrestador)
            expect(res.status).toHaveBeenCalledWith(200)
        })
    })

    describe('cancelar()', () => {
        it('deve retornar 200 com ContratoRespostaDTO cancelado', async () => {
            // Arrange
            const idContrato = new Types.ObjectId().toString()
            const contrato = ContratоMother.criarValido({ idCliente, status: StatusContrato.CANCELADO })
            req = {
                user: { idCliente, idPrestador },
                params: { id: idContrato },
                body: { motivo: 'Motivo de cancelamento' }
            }
            cancelarMock.execute.mockResolvedValue(contrato)
            // Act
            await controller.cancelar(req as any, res as any)
            // Assert
            expect(cancelarMock.execute).toHaveBeenCalledWith(idContrato, idCliente, idPrestador, { motivo: 'Motivo de cancelamento' })
            expect(res.status).toHaveBeenCalledWith(200)
        })
    })
})
