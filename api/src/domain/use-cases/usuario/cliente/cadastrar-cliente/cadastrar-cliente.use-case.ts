import bcrypt from 'bcrypt';

import { config } from "../../../../../shared/config"
import { IUsuarioRepository } from "../../../../repositories/usuario.repository";
import { UsuarioCadastroDTO } from "../../../../dto/usuario/usuario-cadastro.dto";
import { Usuario } from "../../../../entities/usuario/usuario.entity";
import { UsuarioFactory } from "../../../../factories/usuario.factory";

export class CadastrarClienteUseCase {

    constructor(private readonly usuarioRepository: IUsuarioRepository) {

    }

    async execute(usuarioDTO: UsuarioCadastroDTO): Promise<Usuario> {
        const usuario : Usuario = UsuarioFactory.criar({
            nome: usuarioDTO.nome,
            senha: usuarioDTO.senha,
            email: usuarioDTO.email,
            data_cadastro: new Date(),
            ativo: true,
            reputacao_flag_cancelamento: 0
        });
        usuario.senha = await bcrypt.hash(usuario.senha, config.bcryptSaltRounds)

        return this.usuarioRepository.inserir(usuario);
    }
}