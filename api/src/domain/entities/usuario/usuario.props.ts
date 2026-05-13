import { NomeUsuarioValueObject } from "../../value-objects/usuario/nome/nome.vo";
import { SenhaUsuarioValueObject } from "../../value-objects/usuario/senha/senha.vo";
import { EmailUsuarioValueObject } from "../../value-objects/usuario/email/email.vo";

export type UsuarioProps = {
    id ?: string,
    nome : NomeUsuarioValueObject,
    senha : SenhaUsuarioValueObject,
    email : EmailUsuarioValueObject,
    perfis : Array<'cliente' | 'prestador'>,
    data_cadastro : Date,
    ativo : boolean,
    reputacao_flag_cancelamento : number
}