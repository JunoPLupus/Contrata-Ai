import { NomeValueObject } from "../../value-objects/shared/nome/nome.vo";
import { SenhaUsuarioValueObject } from "../../value-objects/usuario/senha/senha.vo";
import { EmailUsuarioValueObject } from "../../value-objects/usuario/email/email.vo";
import { PerfisUsuarioValueObject } from "../../value-objects/usuario/perfis/perfis.vo";

export type UsuarioProps = {
    id ?: string,
    nome : NomeValueObject,
    senha : SenhaUsuarioValueObject,
    email : EmailUsuarioValueObject,
    perfis : PerfisUsuarioValueObject,
    data_cadastro : Date,
    ativo : boolean,
    reputacao_flag_cancelamento : number
}