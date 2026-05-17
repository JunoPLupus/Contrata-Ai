import { Request, Response, NextFunction } from 'express'
import { CampoObrigatorioVazioError } from "../../domain/errors/campo-obrigatorio-vazio.error";
import { FormatoInvalidoError } from "../../domain/errors/formato-invalido.error";
import { ValorLimiteError } from "../../domain/errors/valor-limite.error";

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
    if (err instanceof CampoObrigatorioVazioError || err instanceof FormatoInvalidoError || err instanceof ValorLimiteError) {
        res.status(422).json({ message: err.message })
    } else {
        res.status(500).json({ message: 'Erro interno do servidor' })
    }
}