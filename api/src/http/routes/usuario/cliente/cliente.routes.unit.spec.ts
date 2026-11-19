import express, { NextFunction, Request, Response } from "express";
import request from "supertest";

import { exigeAutenticacao } from "../../../middlewares/exige-autenticacao/exige-autenticacao.middleware";
import { exigePerfilPrestador } from "../../../middlewares/exige-perfil-prestador/exige-perfil-prestador.middleware";
import { clienteController } from "../../../../shared/container";
import clienteRouter from "./cliente.routes";

// Este teste prova só a ligação da rota (quais middlewares e em que ordem). A lógica de cada
// middleware é provada no teste do próprio middleware.
jest.mock("../../../middlewares/exige-autenticacao/exige-autenticacao.middleware", () => ({
    exigeAutenticacao: jest.fn((_req: Request, _res: Response, next: NextFunction) => next())
}))
jest.mock("../../../middlewares/exige-perfil-prestador/exige-perfil-prestador.middleware", () => ({
    exigePerfilPrestador: jest.fn((_req: Request, _res: Response, next: NextFunction) => next())
}))
jest.mock("../../../../shared/container", () => ({
    clienteController: {
        buscarPorId: jest.fn((_req: Request, res: Response) => { res.status(200).json({}) }),
        buscarLogado: jest.fn((_req: Request, res: Response) => { res.status(200).json({}) }),
        cadastrar: jest.fn(),
        atualizar: jest.fn()
    },
    avaliacaoController: { buscarDoCliente: jest.fn() }
}))

describe('clienteRouter', () => {
    const app = express().use(clienteRouter)
    const exigeAutenticacaoMock = exigeAutenticacao as jest.Mock
    const exigePerfilPrestadorMock = exigePerfilPrestador as jest.Mock
    const buscarPorIdMock = clienteController.buscarPorId as jest.Mock

    const idCliente = '507f1f77bcf86cd799439011'
    const rotaPerfilPublico = `/clientes/${idCliente}`

    beforeEach(() => jest.clearAllMocks())

    describe('GET /clientes/:id', () => {
        it('deve exigir autenticação e depois o perfil de prestador em GET /clientes/:id (CA-01)', async () => {
            // Act
            await request(app).get(rotaPerfilPublico)

            // Assert
            expect(exigeAutenticacaoMock).toHaveBeenCalledTimes(1)
            expect(exigePerfilPrestadorMock).toHaveBeenCalledTimes(1)
            expect(exigeAutenticacaoMock.mock.invocationCallOrder[0])
                .toBeLessThan(exigePerfilPrestadorMock.mock.invocationCallOrder[0])
        })

        it('deve chegar ao controller e responder 200 depois dos dois middlewares (CA-02)', async () => {
            // Act
            const resposta = await request(app).get(rotaPerfilPublico)

            // Assert
            expect(resposta.status).toBe(200)
            expect(buscarPorIdMock).toHaveBeenCalledTimes(1)
            expect(buscarPorIdMock.mock.calls[0][0].params.id).toBe(idCliente)
            expect(exigePerfilPrestadorMock.mock.invocationCallOrder[0])
                .toBeLessThan(buscarPorIdMock.mock.invocationCallOrder[0])
        })
    })
})
