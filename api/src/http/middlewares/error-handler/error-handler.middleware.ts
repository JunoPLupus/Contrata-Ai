import { Request, Response, NextFunction } from 'express'
import { MongoServerError } from 'mongodb'

import { DomainError } from "../../../domain/errors/domain.error";

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
    if (err instanceof DomainError) {
        res.status(err.statusCode).json({ message: err.message })

    } else if (err instanceof MongoServerError && err.code === 11000) {
        res.status(422).json({ message: 'Este cadastro já existe.' })

    } else {
        res.status(500).json({ message: 'Erro interno do servidor.' })
    }
}