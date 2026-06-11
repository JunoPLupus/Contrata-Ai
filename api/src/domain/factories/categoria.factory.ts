import { Categoria } from "../entities/categoria/categoria.entity";
import { StringValueObject } from "../value-objects/shared/string/string.vo";

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
            descricao : dados.descricao
        });
    }
}
