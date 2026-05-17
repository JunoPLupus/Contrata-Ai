import bcrypt from 'bcrypt';

import { config } from "../../../../shared/config"
import { IUsuarioRepository } from "../../../repositories/usuario.repository";
import { UsuarioCadastroDTO } from "../../../dto/usuario/usuario-cadastro.dto";
import { Usuario } from "../../../entities/usuario/usuario.entity";
import { NomeUsuarioValueObject } from "../../../value-objects/usuario/nome/nome.vo";
import { SenhaUsuarioValueObject } from "../../../value-objects/usuario/senha/senha.vo";
import { EmailUsuarioValueObject } from "../../../value-objects/usuario/email/email.vo";
import { PerfisUsuarioValueObject } from "../../../value-objects/usuario/perfis/perfis.vo";

export class CadastrarUsuarioUseCase {

    constructor(private readonly usuarioRepository: IUsuarioRepository) {

    }

    async execute(usuarioDTO: UsuarioCadastroDTO): Promise<Usuario> {
        const usuario : Usuario = Usuario.criarUsuario({
            nome: new NomeUsuarioValueObject(usuarioDTO.nome),
            senha: new SenhaUsuarioValueObject(usuarioDTO.senha),
            email: new EmailUsuarioValueObject(usuarioDTO.email),
            perfis: new PerfisUsuarioValueObject(usuarioDTO.perfis),
            data_cadastro: new Date(),
            ativo: true,
            reputacao_flag_cancelamento: 0
        });
        usuario.senha = await bcrypt.hash(usuario.senha, config.bcryptSaltRounds)

        return this.usuarioRepository.inserir(usuario);
    }
}