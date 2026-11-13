import { Request, Response, NextFunction } from 'express'
import { MongoServerError } from 'mongodb'

import { DomainError } from "../../../domain/errors/domain.error";
import { INDICE_AVALIACAO_CONTRATO_AUTOR } from "../../../infra/models/avaliacao/avaliacao.model";

const MENSAGEM_DUPLICIDADE_GENERICA = 'Este cadastro já existe.'

/**
 * Mensagens específicas para violações de índices únicos (E11000), por nome do índice (ADR 010).
 * Índices não listados aqui caem na mensagem genérica. Para mapear um índice novo, dê a ele
 * um `name` explícito no schema e adicione a entrada aqui.
 */
const MENSAGENS_POR_INDICE_UNICO: Record<string, string> = {
    [INDICE_AVALIACAO_CONTRATO_AUTOR]: 'Você já avaliou este contrato.',
}

/**
 * Extrai o nome do índice violado da mensagem do E11000
 * (formato: `E11000 duplicate key error collection: <db>.<coll> index: <nome> dup key: {...}`).
 */
function nomeDoIndiceViolado(err: MongoServerError): string | undefined {
    return /index: (\S+) dup key/.exec(err.message)?.[1]
}

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
    if (err instanceof DomainError) {
        res.status(err.statusCode).json({ message: err.message })

    } else if (err instanceof MongoServerError && err.code === 11000) {
        const indice = nomeDoIndiceViolado(err)
        const mensagem = (indice && MENSAGENS_POR_INDICE_UNICO[indice]) || MENSAGEM_DUPLICIDADE_GENERICA
        res.status(422).json({ message: mensagem })

    } else {
        res.status(500).json({ message: 'Erro interno do servidor.' })
    }
}
