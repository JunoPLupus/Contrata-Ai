import { ICategoriaRepository } from "../../../domain/repositories/categoria.repository";
import { Categoria } from "../../../domain/entities/categoria/categoria.entity";
import { CategoriaModel } from "../../models/categoria/categoria.model";
import { CategoriaMapper } from "./categoria.mapper";

export class CategoriaMongodbRepositoryImpl implements ICategoriaRepository {
    public async buscarTodas(): Promise<Categoria[]> {
        const documentos = await CategoriaModel.find()

        return documentos.map(doc => CategoriaMapper.paraEntidade(doc))
    }

    public async buscarPorId(id: string): Promise<Categoria | null> {
        const documento = await CategoriaModel.findById(id)
        if (!documento) return null

        return CategoriaMapper.paraEntidade(documento)
    }

    public async buscarPorCategoriaPaiId(categoriaPaiId: string): Promise<Categoria[] > {
        const documentos = await CategoriaModel.find({ categoria_pai_id : categoriaPaiId })

        return documentos.map(doc => CategoriaMapper.paraEntidade(doc))
    }
}
