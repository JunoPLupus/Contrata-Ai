import Mocked = jest.Mocked;
import { Request, Response } from "express";

import { errorHandler } from "./error-handler.middleware";
import { CampoObrigatorioVazioError } from "../../../domain/errors/campo-obrigatorio-vazio.error";
import { FormatoInvalidoError } from "../../../domain/errors/formato-invalido.error";
import { ValorLimiteError } from "../../../domain/errors/valor-limite.error";

describe('Error Handler Middleware', () => {
    let req: Partial<Request>
    let res: Partial<Response>
    let nextMock : Mocked<any>

    beforeEach(() => {
        req = { body: '' }
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        }
        nextMock = jest.fn()
    })

    it('deve responder com código 422 quando capturar CampoObrigatorioVazioError', () => {
        // Arrange
        const err = new CampoObrigatorioVazioError('nome')
        // Act
        errorHandler(err, req as any, res as any, nextMock)
        // Assert
        expect(res.status).toHaveBeenCalledWith(422)
    })

    it('deve responder com código 422 quando capturar FormatoInvalidoError', () => {
        // Arrange
        const err = new FormatoInvalidoError('nome')
        // Act
        errorHandler(err, req as any, res as any, nextMock)
        // Assert
        expect(res.status).toHaveBeenCalledWith(422)
    })

    it('deve responder com código 422 quando capturar ValorLimiteError', () => {
        // Arrange
        const err = new ValorLimiteError('nome', 64, 'máximo')
        // Act
        errorHandler(err, req as any, res as any, nextMock)
        // Assert
        expect(res.status).toHaveBeenCalledWith(422)
    })

    it('deve responder com código 500 quando capturar qualquer outro tipo de erro', () => {
        // Arrange
        const err = new TypeError()
        // Act
        errorHandler(err, req as any, res as any, nextMock)
        // Assert
        expect(res.status).toHaveBeenCalledWith(500)
    })
})