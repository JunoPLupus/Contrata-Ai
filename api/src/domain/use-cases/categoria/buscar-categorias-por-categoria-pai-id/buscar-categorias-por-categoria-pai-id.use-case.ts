import { Categoria } from "../../../entities/categoria/categoria.entity";
import { ICategoriaRepository } from "../../../repositories/categoria.repository";

export class BuscarCategoriasPorCategoriaPaiIdUseCase {
    constructor(private readonly categoriaRepository : ICategoriaRepository) {}

    async execute(categoriaPaiId: string): Promise<Categoria[] > {
        return await this.categoriaRepository.buscarPorCategoriaPaiId(categoriaPaiId)
    }
}