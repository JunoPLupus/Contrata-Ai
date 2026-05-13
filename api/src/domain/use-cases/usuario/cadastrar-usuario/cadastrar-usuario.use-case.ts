import bcrypt from 'bcrypt';

import { IUsuarioRepository } from "../../../repositories/usuario.repository";
import { UsuarioCadastroDTO } from "../../../dto/usuario/usuario-cadastro.dto";
import { Usuario } from "../../../entities/usuario/usuario.entity";
import { NomeUsuarioValueObject } from "../../../value-objects/usuario/nome/nome.vo";
import { SenhaUsuarioValueObject } from "../../../value-objects/usuario/senha/senha.vo";
import { EmailUsuarioValueObject } from "../../../value-objects/usuario/email/email.vo";

export class CadastrarUsuarioUseCase {

    constructor(private readonly usuarioRepository: IUsuarioRepository) {

    }

    async execute(usuarioDTO: UsuarioCadastroDTO): Promise<Usuario> {
        const senhaHash = await bcrypt.hash(usuarioDTO.senha, 10);
        const usuarioProps = {
            nome: new NomeUsuarioValueObject(usuarioDTO.nome),
            senha: new SenhaUsuarioValueObject(senhaHash),
            email: new EmailUsuarioValueObject(usuarioDTO.email),
            perfis: usuarioDTO.perfis,
            data_cadastro: new Date(),
            ativo: true,
            reputacao_flag_cancelamento: 0
        }
        const usuario : Usuario = Usuario.criarUsuario(usuarioProps);

        return this.usuarioRepository.inserir(usuario);
    }
}