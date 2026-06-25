import { Request, Response } from 'express';
import { Types } from 'mongoose';

import { ExtensaoPrazoController } from "./extensao-prazo.controller";
import { SolicitarExtensaoPrazoUseCase } from "../../../domain/use-cases/extensao-prazo/solicitar-extensao-prazo/solicitar-extensao-prazo.use-case";
import { ResponderExtensaoPrazoUseCase } from "../../../domain/use-cases/extensao-prazo/responder-extensao-prazo/responder-extensao-prazo.use-case";
import { ExtensaoPrazoMother } from "../../../test-helpers/extensao-prazo.mother";
import { ExtensaoPrazoMapper } from "../../mappers/extensao-prazo/extensao-prazo.mapper";
import { StatusExtensaoPrazo } from "../../../domain/value-objects/extensao-prazo/status/status.vo";

describe('Testes Unitários do Controller: Extensão-Prazo', () => {
    let controller: ExtensaoPrazoController
    let solicitarMock: jest.Mocked<SolicitarExtensaoPrazoUseCase>
    let responderMock: jest.Mocked<ResponderExtensaoPrazoUseCase>
    let req: Partial<Request>
    let res: Partial<Response>

    const idCliente = new Types.ObjectId().toString()
    const idPrestador = new Types.ObjectId().toString()
    const idContrato = new Types.ObjectId().toString()

    beforeEach(() => {
        solicitarMock = { execute: jest.fn() } as any
        responderMock = { execute: jest.fn() } as any
        controller = new ExtensaoPrazoController(solicitarMock, responderMock)

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        }
    })

    describe('solicitarExtensao()', () => {
        it('deve retornar 201 com ExtensaoPrazoRespostaDTO', async () => {
            // Arrange
            const extensao = ExtensaoPrazoMother.criarValido({ idContrato })
            req = {
                user: { idCliente, idPrestador },
                params: { id: idContrato },
                body: {
                    novoPrazo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                    justificativa: 'Preciso de mais tempo para finalizar.'
                }
            }
            solicitarMock.execute.mockResolvedValue(extensao)
            // Act
            await controller.solicitarExtensao(req as any, res as any)
            // Assert
            expect(solicitarMock.execute).toHaveBeenCalledWith(
                idContrato,
                idPrestador,
                expect.objectContaining({ justificativa: 'Preciso de mais tempo para finalizar.' })
            )
            expect(res.status).toHaveBeenCalledWith(201)
            expect(res.json).toHaveBeenCalledWith(ExtensaoPrazoMapper.paraRespostaDTO(extensao))
        })
    })

    describe('responderExtensao()', () => {
        it('deve retornar 200 com ExtensaoPrazoRespostaDTO ao aprovar', async () => {
            // Arrange
            const idExtensao = new Types.ObjectId().toString()
            const extensao = ExtensaoPrazoMother.criarValido({ idContrato, status: StatusExtensaoPrazo.APROVADA })
            req = {
                user: { idCliente, idPrestador },
                params: { id: idContrato, idExtensao },
                body: { decisao: StatusExtensaoPrazo.APROVADA }
            }
            responderMock.execute.mockResolvedValue(extensao)
            // Act
            await controller.responderExtensao(req as any, res as any)
            // Assert
            expect(responderMock.execute).toHaveBeenCalledWith(
                idContrato,
                idExtensao,
                idCliente,
                { decisao: StatusExtensaoPrazo.APROVADA }
            )
            expect(res.status).toHaveBeenCalledWith(200)
        })
    })
})
