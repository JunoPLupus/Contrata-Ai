import { Categoria } from "../../../entities/categoria/categoria.entity";
import { ICategoriaRepository } from "../../../repositories/categoria.repository";
import { RecursoNaoEncontradoError } from "../../../errors/recurso-nao-encontrado.error";

export class BuscarCategoriaPorIdUseCase {
    constructor(private readonly categoriaRepository: ICategoriaRepository) {}

    async execute(id : string) : Promise< Categoria | null > {
        const categoriaEncontrada = await this.categoriaRepository.buscarPorId(id)

        if (categoriaEncontrada == null) throw new RecursoNaoEncontradoError('Categoria')

        return categoriaEncontrada
    }
}