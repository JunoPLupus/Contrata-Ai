import { ICategoriaRepository } from "../../../domain/repositories/categoria.repository";
import { Categoria } from "../../../domain/entities/categoria/categoria.entity";
import { CategoriaModel } from "../../models/categoria/categoria.model";
import { CategoriaMapper } from "./categoria.mapper";

export class CategoriaMongodbRepositoryImpl implements ICategoriaRepository {
    public async buscarPorId(id: string): Promise<Categoria | null> {
        const documento = await CategoriaModel.findById(id);
        if (!documento) return null;

        return CategoriaMapper.paraEntidade(documento);
    }

    public async buscarPorNome(nome: string): Promise<Categoria | null> {
        const documento = await CategoriaModel.findOne({ nome: nome });
        if (!documento) return null;

        return CategoriaMapper.paraEntidade(documento);
    }
}
