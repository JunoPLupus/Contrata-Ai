import { Prestador } from "../entities/prestador/prestador.entity";
import { StringValueObject } from "../value-objects/shared/string/string.vo";
import { TelefoneUsuarioValueObject } from "../value-objects/usuario/telefone/telefone.vo";
import { isStringVazia } from "../utils/value-objects.utils";

export class PrestadorFactory {
    public static criar(dados: {
        id ?: string
        idCliente : string
        telefone ?: string
        descricao ?: string
        ativo ?: boolean
    }) : Prestador {
        return Prestador.criarPrestador({
            id : dados.id,
            idCliente : new StringValueObject('idCliente', dados.idCliente),
            telefone : !isStringVazia(dados.telefone) ? new TelefoneUsuarioValueObject('telefone', dados.telefone) : undefined,
            descricao : !isStringVazia(dados.descricao) ? new StringValueObject('descricao', dados.descricao, 5, 500) : undefined,
            ativo : dados.ativo ?? true
        })
    }
}
