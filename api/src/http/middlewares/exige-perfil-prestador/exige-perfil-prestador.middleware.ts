import { NextFunction, Request, Response } from "express";

/**
 * Bloqueia se o payload do token JWT não contiver o campo `idPrestador`.
 * Deve ser usado após o middleware `exigeAutenticacao`, que popula o `req.user`.
 * @param req - Requisição com `req.user` já populado pelo middleware de autenticação.
 * @param res - Resposta que retorna `403` caso o perfil de prestador não esteja no token.
 * @param next - Chamado caso o `idPrestador` esteja presente no payload.
 */
export function exigePerfilPrestador(req: Request, res: Response, next: NextFunction): void {
    if (!req.user?.idPrestador) return void res.status(403).json({ message: "Acesso negado! É necessário ter o perfil de prestador ativo." })
    return next()
}
