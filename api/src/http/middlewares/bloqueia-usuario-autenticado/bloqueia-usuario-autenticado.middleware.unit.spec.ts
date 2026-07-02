import jwt, { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { Request, Response } from "express";

import { bloqueiaUsuarioAutenticado } from "./bloqueia-usuario-autenticado.middleware";
import { TokenPayload } from "../../types/token-payload.interface";

jest.mock('jsonwebtoken', () => ({
    verify: jest.fn()
}))

describe('BloqueiaUsuarioAutenticado Middleware', () => {
    let req: Partial<Request>
    let res: Partial<Response>
    let nextMock : jest.Mocked<any>
    let payload: TokenPayload

    beforeEach(() => {
        req = { headers: { authorization: undefined } }
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        }
        nextMock = jest.fn()
        payload = {
            idCliente : '123'
        }
    })

    it('deve usar next() caso não encontre um token jwt', async () => {
        // Act
        bloqueiaUsuarioAutenticado(req as any, res as any, nextMock)
        // Assert
        expect(jwt.verify).not.toHaveBeenCalled()
        expect(nextMock).toHaveBeenCalled()
        expect(res.status).not.toHaveBeenCalled()
    })

    it('deve usar next() caso encontre um token jwt vazio', async () => {
        // Arrange
        (req.headers as any).authorization = 'Bearer ';
        (jwt.verify as jest.Mock).mockImplementation(() => {
            throw new JsonWebTokenError('Token inválido.')
        })
        // Act
        bloqueiaUsuarioAutenticado(req as any, res as any, nextMock)
        // Assert
        expect(jwt.verify).toHaveBeenCalled()
        expect(nextMock).toHaveBeenCalled()
        expect(res.status).not.toHaveBeenCalled()
    })

    it('deve usar next() caso encontre um token jwt expirado', async () => {
        // Arrange
        (req.headers as any).authorization = 'Bearer token_expirado';
        (jwt.verify as jest.Mock).mockImplementation(() => {
            throw new TokenExpiredError('Token expirado.', new Date())
        })
        // Act
        bloqueiaUsuarioAutenticado(req as any, res as any, nextMock)
        // Assert
        expect(jwt.verify).toHaveBeenCalled()
        expect(nextMock).toHaveBeenCalled()
        expect(res.status).not.toHaveBeenCalled()
    })

    it('deve responder com código 403 caso encontre um token válido', async () => {
        // Arrange
        (req.headers as any).authorization = 'Bearer token_valido'
        jwt.verify = jest.fn().mockReturnValue(payload)
        // Act
        bloqueiaUsuarioAutenticado(req as any, res as any, nextMock)
        // Assert
        expect(res.status).toHaveBeenCalledWith(403)
        expect(nextMock).not.toHaveBeenCalled()
    })
})