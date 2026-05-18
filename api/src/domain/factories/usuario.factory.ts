import { Usuario } from "../entities/usuario/usuario.entity";
import { NomeUsuarioValueObject } from "../value-objects/usuario/nome/nome.vo";
import { EmailUsuarioValueObject } from "../value-objects/usuario/email/email.vo";
import { SenhaUsuarioValueObject } from "../value-objects/usuario/senha/senha.vo";
import { PerfisUsuarioValueObject } from "../value-objects/usuario/perfis/perfis.vo";

export class UsuarioFactory {
    public static criar(dados: {
        id ?: string
        nome : string
        email : string
        senha : string
        perfis : string[]
        ativo : boolean
        data_cadastro : Date
        reputacao_flag_cancelamento : number
    }) : Usuario {
        return Usuario.criarUsuario({
            id : dados.id,
            nome : new NomeUsuarioValueObject(dados.nome),
            email : new EmailUsuarioValueObject(dados.email),
            senha : new SenhaUsuarioValueObject(dados.senha),
            perfis : new PerfisUsuarioValueObject(dados.perfis),
            data_cadastro : dados.data_cadastro,
            ativo : dados.ativo,
            reputacao_flag_cancelamento : dados.reputacao_flag_cancelamento
        })
    }
}