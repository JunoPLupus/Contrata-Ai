import { Request, Response } from "express";

import { exigePerfilPrestador } from "./exige-perfil-prestador.middleware";

describe('ExigePerfilPrestador Middleware', () => {
    let req: Partial<Request>
    let res: Partial<Response>
    let nextMock: jest.Mocked<any>

    beforeEach(() => {
        req = { user: undefined }
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        }
        nextMock = jest.fn()
    })

    it('deve usar next() caso o idPrestador esteja presente no token.', () => {
        // Arrange
        req.user = { idCliente: '123', idPrestador: '456' }
        // Act
        exigePerfilPrestador(req as any, res as any, nextMock)
        // Assert
        expect(nextMock).toHaveBeenCalled()
        expect(res.status).not.toHaveBeenCalled()
    })

    it('deve responder com código 403 caso o idPrestador não esteja no token.', () => {
        // Arrange
        req.user = { idCliente: '123' }
        // Act
        exigePerfilPrestador(req as any, res as any, nextMock)
        // Assert
        expect(nextMock).not.toHaveBeenCalled()
        expect(res.status).toHaveBeenCalledWith(403)
    })

    it('deve responder com código 403 caso req.user esteja indefinido.', () => {
        // Act
        exigePerfilPrestador(req as any, res as any, nextMock)
        // Assert
        expect(nextMock).not.toHaveBeenCalled()
        expect(res.status).toHaveBeenCalledWith(403)
    })
})
