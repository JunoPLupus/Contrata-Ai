import { Categoria } from "../../../entities/categoria/categoria.entity";
import { ICategoriaRepository } from "../../../repositories/categoria.repository";

export class BuscarTodasCategoriasUseCase {
    constructor(private categoriaRepository: ICategoriaRepository) {}

    async execute() : Promise< Categoria[] > {
        return await this.categoriaRepository.buscarTodas()
    }
}