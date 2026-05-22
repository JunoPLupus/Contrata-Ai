import { Categoria } from "../entities/categoria/categoria.entity";

export abstract class ICategoriaRepository {
    /**
     * Busca uma categoria pelo identificador unico.
     * @param id - ID da categoria a ser pesquisada.
     * @returns A categoria encontrada, ou `null` se nao existir registro com esse ID.
     */
    abstract buscarPorId(id: string): Promise<Categoria | null>;

    /**
     * Busca uma categoria pelo nome.
     * @param nome - Nome da categoria a ser pesquisada.
     * @returns A categoria encontrada, ou `null` se nenhuma categoria possuir esse nome.
     */
    abstract buscarPorNome(nome: string): Promise<Categoria | null>;
}
