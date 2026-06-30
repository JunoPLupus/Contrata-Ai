import { NextFunction, Request, Response } from "express";

import { isTokenValido } from "../../utils/jwt.utils";

/**
 * Bloqueia se não encontrar um _token JWT_ válido no header.
 * @params `req` - Requisição que será usada para a verificação do _header_.
 * @params `res` - Resposta que pode retornar `403` caso o _token_ seja inválido.
 * @params `next` - Usado para encerrar a execução do _middleware_ caso encontre um _token_ válido.
 */
export function exigeAutenticacao(req: Request, res: Response, next: NextFunction) : void {
    const authentication = req.headers.authorization
    const tokenPayload = isTokenValido(authentication)
    if (tokenPayload == null) return void res.status(403).json({ message: "Acesso negado! É necessário se autenticar novamente." })

    req.user = tokenPayload
    return next()
}