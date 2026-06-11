import { StringValueObject } from "../../value-objects/shared/string/string.vo";
import { EmailUsuarioValueObject } from "../../value-objects/usuario/email/email.vo";

export type UsuarioProps = {
    id ?: string,
    idPrestador ?: StringValueObject,
    nome : StringValueObject,
    senha : StringValueObject,
    email : EmailUsuarioValueObject,
    data_cadastro : Date,
    ativo : boolean,
    reputacao_flag_cancelamento : number
}
