import { Usuario } from "../entities/usuario/usuario.entity";
import { StringValueObject } from "../value-objects/shared/string/string.vo";
import { EmailUsuarioValueObject } from "../value-objects/usuario/email/email.vo";
import { isStringVazia } from "../utils/value-objects.utils";

export class UsuarioFactory {
    public static criar(dados: {
        id ?: string
        idPrestador ?: string
        nome : string
        email : string
        senha : string
        ativo : boolean
        data_cadastro : Date
        reputacao_flag_cancelamento : number
    }) : Usuario {
        return Usuario.criarUsuario({
            id : dados.id,
            idPrestador : !isStringVazia(dados.idPrestador) ? new StringValueObject('idPrestador', dados.idPrestador) : undefined,
            nome : new StringValueObject('nome', dados.nome, 3, 150),
            email : new EmailUsuarioValueObject(dados.email),
            senha : new StringValueObject('senha', dados.senha, 6, 64),
            data_cadastro : dados.data_cadastro,
            ativo : dados.ativo,
            reputacao_flag_cancelamento : dados.reputacao_flag_cancelamento
        })
    }
}
