import { Request, Response } from "express";
import jwt, { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

import { exigeAutenticacao } from "./exige-autenticacao.middleware";
import { TokenPayload } from "../../types/token-payload.interface";

jest.mock('jsonwebtoken', () => ({
    verify: jest.fn()
}))

describe('ExigeAutenticacao Middleware', () => {
    let req: Partial<Request>
    let res: Partial<Response>
    let nextMock : jest.Mocked<any>
    let payload: TokenPayload

    beforeEach(() => {
        jest.clearAllMocks()
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

    it('deve usar next() caso exista um token válido.', async () => {
        // Arrange
        (req.headers as any).authorization = 'Bearer token_valido'
        jwt.verify = jest.fn().mockReturnValue(payload)
        // Act
        exigeAutenticacao(req as any, res as any, nextMock)
        // Assert
        expect(req.user).toBe(payload)
        expect(nextMock).toHaveBeenCalled()
    })

    it('deve responder com código 403 caso não exista um token', async () => {
        // Act
        exigeAutenticacao(req as any, res as any, nextMock)
        // Assert
        expect(jwt.verify).not.toHaveBeenCalled()
        expect(nextMock).not.toHaveBeenCalled()
        expect(res.status).toHaveBeenCalledWith(403)
    })

    it('deve responder com código 403 caso o token esteja vazio', async () => {
        // Arrange
        (req.headers as any).authorization = 'Bearer ';
        (jwt.verify as jest.Mock).mockImplementation(() => {
            throw new JsonWebTokenError('Token inválido.')
        })
        // Act
        exigeAutenticacao(req as any, res as any, nextMock)
        // Assert
        expect(jwt.verify).toHaveBeenCalled()
        expect(nextMock).not.toHaveBeenCalled()
        expect(res.status).toHaveBeenCalledWith(403)
    })

    it('deve responder com código 403 caso o token esteja expirado', async () =>{
        // Arrange
        (req.headers as any).authorization = 'Bearer token_expirado';
        (jwt.verify as jest.Mock).mockImplementation(() => {
            throw new TokenExpiredError('Token expirado.', new Date())
        })
        // Act
        exigeAutenticacao(req as any, res as any, nextMock)
        // Assert
        expect(jwt.verify).toHaveBeenCalled()
        expect(nextMock).not.toHaveBeenCalled()
        expect(res.status).toHaveBeenCalledWith(403)
    })
})