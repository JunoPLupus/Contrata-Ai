import { Categoria } from "../entities/categoria/categoria.entity";
import { NomeValueObject } from "../value-objects/shared/nome/nome.vo";

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
            nome : new NomeValueObject(dados.nome),
            descricao : dados.descricao
        });
    }
}