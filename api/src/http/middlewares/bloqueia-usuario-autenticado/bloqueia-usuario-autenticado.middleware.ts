import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";

import { config } from "../../../shared/config";

export function bloqueiaUsuarioAutenticado(req : Request, res : Response, next: NextFunction) : void {
    const tokenEncontrado = req.headers.authorization
    if (typeof tokenEncontrado != "string") return next()

    const tokenJWT = tokenEncontrado.split(' ')[1]
    try {
        jwt.verify(tokenJWT, config.jwtSecret)
    } catch (error : any) {
        return next()
    }
    res.status(403).json({ message : "Login duplicado não permitido! Você já possui um login ativo." })
}