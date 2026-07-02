import { HydratedDocument, Types } from "mongoose";

import { ICategoriaDocument } from "../../models/categoria/categoria.model";
import { Categoria } from "../../../domain/entities/categoria/categoria.entity";
import { CategoriaFactory } from "../../../domain/factories/categoria.factory";

export class CategoriaMapper {
    public static paraEntidade(doc: HydratedDocument<ICategoriaDocument>): Categoria {
        return CategoriaFactory.criar({
            id: doc.id.toString(),
            categoriaPaiId: doc.categoria_pai_id?.toString(),
            nome: doc.nome,
            descricao: doc.descricao
        })
    }

    public static paraDocumento(categoria: Categoria): ICategoriaDocument {
        return {
            categoria_pai_id: categoria.categoriaPaiId == undefined
                ? undefined
                : new Types.ObjectId(categoria.categoriaPaiId),
            nome: categoria.nome,
            descricao: categoria.descricao
        }
    }
}
