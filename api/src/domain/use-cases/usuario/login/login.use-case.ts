import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';

import { config } from "../../../../shared/config"
import { IUsuarioRepository } from "../../../repositories/usuario.repository";
import { UsuarioLoginDTO } from "../../../dto/usuario/usuario-login.dto";
import { CredenciaisInvalidasError } from "../../../errors/credenciais-invalidas.error";

export class LoginUseCase {
    constructor(private readonly usuarioRepository : IUsuarioRepository) {}

    /**
     * Verifique as credenciais e retorna um token JWT.
     * @param usuarioDTO - `UsuarioLoginDTO` { email: '', senha: '' }
     * @return `string` - Token JWT.
     * @throws {CredenciaisInvalidasError} se o usuário não existir ou a senha estiver incorreta.
     */
    async execute(usuarioDTO : UsuarioLoginDTO): Promise<string> {
        const usuarioEncontrado = await this.usuarioRepository.buscarPorEmail(usuarioDTO.email)

        if (usuarioEncontrado == null) throw new CredenciaisInvalidasError()
        if (!await bcrypt.compare(usuarioDTO.senha, usuarioEncontrado.senha)) throw new CredenciaisInvalidasError()

        const payload = { idCliente : usuarioEncontrado.id }

        return jwt.sign(payload, config.jwtSecret, { expiresIn: '2h' })
    }
}