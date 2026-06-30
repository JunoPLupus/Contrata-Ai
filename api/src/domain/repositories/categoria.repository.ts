import { Categoria } from "../entities/categoria/categoria.entity";

export abstract class ICategoriaRepository {
    /**
     * Busca todas as categorias
     * @returns Lista com todas as categorias cadastradas no banco de dados.
     */
    abstract buscarTodas(): Promise<Categoria[]>

    /**
     * Busca uma categoria pelo identificador unico.
     * @param id - ID da categoria a ser pesquisada.
     * @returns A categoria encontrada, ou `null` se nao existir registro com esse ID.
     */
    abstract buscarPorId(id: string): Promise<Categoria | null>

    /**
     * Busca todas as categorias filhas de uma categoria.
     * @param categoriaPaiId - id da categoria pai usada para a pesquisa.
     * @returns Lista de categorias filhas de uma categoria, caso exista.
     */
    abstract buscarPorCategoriaPaiId(categoriaPaiId: string): Promise<Categoria[] >
}
