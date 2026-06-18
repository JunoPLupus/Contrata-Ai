import { Types } from "mongoose";

import { Categoria } from "../domain/entities/categoria/categoria.entity";
import { CategoriaFactory } from "../domain/factories/categoria.factory";

export class CategoriaMother {
    public static criarValido(dados?: Partial<{
        id : string,
        categoriaPaiId: string,
        nome: string,
        descricao: string
    }>): Categoria {
        return CategoriaFactory.criar({
            id: dados?.id ?? (new Types.ObjectId).toString(),
            categoriaPaiId: dados?.categoriaPaiId,
            nome: dados?.nome ?? 'Eletricidade',
            descricao: dados?.descricao
        })
    }
}
