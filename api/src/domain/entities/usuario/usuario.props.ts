import { NomeValueObject } from "../../value-objects/shared/nome/nome.vo";
import { SenhaUsuarioValueObject } from "../../value-objects/usuario/senha/senha.vo";
import { EmailUsuarioValueObject } from "../../value-objects/usuario/email/email.vo";
import { IdPrestadorValueObject } from "../../value-objects/prestador/idPrestador/id-prestador.vo";

export type UsuarioProps = {
    id ?: string,
    idPrestador ?: IdPrestadorValueObject,
    nome : NomeValueObject,
    senha : SenhaUsuarioValueObject,
    email : EmailUsuarioValueObject,
    data_cadastro : Date,
    ativo : boolean,
    reputacao_flag_cancelamento : number
}