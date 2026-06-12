import { StringValueObject } from "../../value-objects/shared/string/string.vo";
import { EmailUsuarioValueObject } from "../../value-objects/usuario/email/email.vo";
import { TelefoneUsuarioValueObject } from "../../value-objects/usuario/telefone/telefone.vo";
import { CepValueObject } from "../../value-objects/usuario/cep/cep.vo";

export type UsuarioProps = {
    id ?: string,
    idPrestador ?: StringValueObject,
    nome : StringValueObject,
    senha : StringValueObject,
    email : EmailUsuarioValueObject,
    telefone ?: TelefoneUsuarioValueObject,
    whatsapp ?: TelefoneUsuarioValueObject,
    localizacaoCidade ?: StringValueObject,
    localizacaoCep ?: CepValueObject,
    data_cadastro : Date,
    ativo : boolean,
    reputacao_flag_cancelamento : number
}
