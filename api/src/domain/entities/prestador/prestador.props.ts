import { StringValueObject } from "../../value-objects/shared/string/string.vo";
import { TelefoneUsuarioValueObject } from "../../value-objects/usuario/telefone/telefone.vo";

export type PrestadorProps = {
    id ?: string
    idCliente : StringValueObject
    telefone ?: TelefoneUsuarioValueObject
    descricao ?: StringValueObject
    ativo : boolean
    // TODO: Value object de latitude (apenas quando for implementar pesquisa por proximidade)
    // TODO: Value object de longitude (apenas quando for implementar pesquisa por proximidade)
}
