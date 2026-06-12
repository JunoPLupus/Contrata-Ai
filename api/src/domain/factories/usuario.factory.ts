import { Usuario } from "../entities/usuario/usuario.entity";
import { StringValueObject } from "../value-objects/shared/string/string.vo";
import { EmailUsuarioValueObject } from "../value-objects/usuario/email/email.vo";
import { TelefoneUsuarioValueObject } from "../value-objects/usuario/telefone/telefone.vo";
import { CepValueObject } from "../value-objects/usuario/cep/cep.vo";
import { isStringVazia } from "../utils/value-objects.utils";

export class UsuarioFactory {
    public static criar(dados: {
        id ?: string
        idPrestador ?: string
        nome : string
        email : string
        senha : string
        telefone ?: string
        whatsapp ?: string
        localizacaoCidade ?: string
        localizacaoCep ?: string
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
            telefone : !isStringVazia(dados.telefone) ? new TelefoneUsuarioValueObject('telefone', dados.telefone) : undefined,
            whatsapp : !isStringVazia(dados.whatsapp) ? new TelefoneUsuarioValueObject('whatsapp', dados.whatsapp) : undefined,
            localizacaoCidade : !isStringVazia(dados.localizacaoCidade) ? new StringValueObject('localizacaoCidade', dados.localizacaoCidade, 3, 32) : undefined,
            localizacaoCep : !isStringVazia(dados.localizacaoCep) ? new CepValueObject(dados.localizacaoCep) : undefined,
            data_cadastro : dados.data_cadastro,
            ativo : dados.ativo,
            reputacao_flag_cancelamento : dados.reputacao_flag_cancelamento
        })
    }
}
