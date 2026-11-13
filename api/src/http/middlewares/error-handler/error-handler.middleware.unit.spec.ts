import Mocked = jest.Mocked;
import { Request, Response } from "express";
import { MongoServerError } from "mongodb";

import { errorHandler } from "./error-handler.middleware";
import { CampoObrigatorioVazioError } from "../../../domain/errors/campo-obrigatorio-vazio.error";
import { FormatoInvalidoError } from "../../../domain/errors/formato-invalido.error";
import { ValorLimiteError } from "../../../domain/errors/valor-limite.error";
import { CredenciaisInvalidasError } from "../../../domain/errors/credenciais-invalidas.error";

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

    it('deve responder com código 422 quando capturar código 11000 do MongoServerError', () => {
        // Arrange
        const err = new MongoServerError({ message: 'duplicate key error' })
        err.code = 11000
        // Act
        errorHandler(err, req as any, res as any, nextMock)
        // Assert
        expect(res.status).toHaveBeenCalledWith(422)
    })

    it('deve responder com a mensagem genérica quando o índice violado não estiver mapeado', () => {
        // Arrange
        const err = new MongoServerError({
            message: 'E11000 duplicate key error collection: contrataai.prestadores index: id_cliente_1 dup key: { id_cliente: ObjectId(\'665f1b2c9a1e4a0012abcd34\') }'
        })
        err.code = 11000
        // Act
        errorHandler(err, req as any, res as any, nextMock)
        // Assert
        expect(res.status).toHaveBeenCalledWith(422)
        expect(res.json).toHaveBeenCalledWith({ message: 'Este cadastro já existe.' })
    })

    it('deve responder com a mensagem genérica quando o E11000 não informar o índice', () => {
        // Arrange
        const err = new MongoServerError({ message: 'duplicate key error' })
        err.code = 11000
        // Act
        errorHandler(err, req as any, res as any, nextMock)
        // Assert
        expect(res.json).toHaveBeenCalledWith({ message: 'Este cadastro já existe.' })
    })

    it('deve responder com mensagem específica quando violar o índice único de avaliação por contrato e autor', () => {
        // Arrange
        const err = new MongoServerError({
            message: 'E11000 duplicate key error collection: contrataai.avaliacoes index: avaliacao_contrato_autor_unico dup key: { id_contrato: ObjectId(\'665f1b2c9a1e4a0012abc040\'), autor: "cliente" }'
        })
        err.code = 11000
        // Act
        errorHandler(err, req as any, res as any, nextMock)
        // Assert
        expect(res.status).toHaveBeenCalledWith(422)
        expect(res.json).toHaveBeenCalledWith({ message: 'Você já avaliou este contrato.' })
    })

    it('deve responder com código 401 quando capturar CredenciaisInvalidasError', () => {
        // Arrange
        const err = new CredenciaisInvalidasError()
        // Act
        errorHandler(err, req as any, res as any, nextMock)
        // Assert
        expect(res.status).toHaveBeenCalledWith(401)
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