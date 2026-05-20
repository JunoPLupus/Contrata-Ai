import { NextFunction, Request, Response } from "express";

import { isTokenValido } from "../../utils/jwt.utils";

/**
 * Bloqueia se encontrar um _token JWT_ válido no header.
 * @params `req` - Requisição que será usada para a verificação do _header_.
 * @params `res` - Resposta que pode retornar `403` caso o _token_ seja válido.
 * @params `next` - Usado para encerrar a execução do _middleware_ caso não encontre um _token_ válido.
 */
export function bloqueiaUsuarioAutenticado(req : Request, res : Response, next: NextFunction) : void {
    if (isTokenValido(req.headers.authorization) == null) return next()

    res.status(403).json({ message : "Login duplicado não permitido! Você já possui um login ativo." })
}