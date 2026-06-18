import { Types } from "mongoose";

import { Categoria } from "../domain/entities/categoria/categoria.entity";
import { CategoriaFactory } from "../domain/factories/categoria.factory";
import { ICategoriaRepository } from "../domain/repositories/categoria.repository";

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

    public static criarLista(quantidade = 3,
                             dados?: Partial<{
                                 id : string,
                                 categoriaPaiId: string,
                                 nome: string,
                                 descricao: string
                            }>): Categoria[] {
        return Array.from({ length: quantidade }, () => this.criarValido(dados))
    }

    public static criarRepositoryMock() : jest.Mocked<ICategoriaRepository> {
        return {
            buscarTodas : jest.fn(),
            buscarPorId : jest.fn(),
            buscarPorCategoriaPaiId : jest.fn()
        }
    }
}
