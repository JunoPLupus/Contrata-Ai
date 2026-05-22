import { Categoria } from "../domain/entities/categoria/categoria.entity";
import { CategoriaFactory } from "../domain/factories/categoria.factory";

export class CategoriaMother {
    public static criarValido(dados?: Partial<{
        nome: string,
        categoriaPaiId: string,
        descricao: string
    }>): Categoria {
        return CategoriaFactory.criar({
            nome: dados?.nome ?? 'Eletricidade',
            categoriaPaiId: dados?.categoriaPaiId,
            descricao: dados?.descricao
        })
    }
}
