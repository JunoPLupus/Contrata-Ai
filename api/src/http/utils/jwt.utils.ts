import jwt from "jsonwebtoken";

import { config } from "../../shared/config";
import { TokenPayload } from "../types/token-payload.interface";

export function isTokenValido(authorization: string | undefined) : TokenPayload | null  {
    if (typeof authorization != "string") return null

    const tokenJWT = authorization.split(' ')[1]
    try {
        return jwt.verify(tokenJWT, config.jwtSecret) as TokenPayload
    } catch (error : any) {
        return null
    }
}