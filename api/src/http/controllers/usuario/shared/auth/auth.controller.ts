import { Request, Response } from "express";

import { LoginUseCase } from "../../../../../domain/use-cases/usuario/shared/login/login.use-case";
import { UsuarioLoginDTO } from "../../../../../domain/dto/usuario/usuario-login.dto";

export class AuthController {
    constructor(private readonly loginUseCase : LoginUseCase) {}
    /**
     * Efetua o login.
     * @param request - body : `UsuarioLoginDTO` { email: '', senha: '' }
     * @param response - 'status: 200' e 'json: tokenJWT'.
     */
    public async login(request : Request, response : Response) : Promise<void> {
        const usuarioDTO = request.body as unknown as UsuarioLoginDTO
        const tokenJWT = await this.loginUseCase.execute(usuarioDTO)

        response.status(200).json(tokenJWT)
    }
}