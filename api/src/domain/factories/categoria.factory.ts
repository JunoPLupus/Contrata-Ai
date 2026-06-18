import { Categoria } from "../entities/categoria/categoria.entity";
import { StringValueObject } from "../value-objects/shared/string/string.vo";
import { isStringVazia } from "../utils/value-objects.utils";

export class CategoriaFactory {
    public static criar(dados : {
        id ?: string,
        categoriaPaiId ?: string,
        nome : string,
        descricao ?: string
    }) : Categoria {
        return Categoria.criarCategoria({
            id : dados.id,
            categoriaPaiId : dados.categoriaPaiId,
            nome : new StringValueObject('nome', dados.nome, 3, 150),
            descricao : isStringVazia(dados.descricao) ? undefined : new StringValueObject('descricao', dados.descricao, 5, 300)
        })
    }
}
