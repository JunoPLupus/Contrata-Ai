import { Categoria } from "../../../domain/entities/categoria/categoria.entity";

export type CategoriaDetalheRespostaDTO = Pick<Categoria, 'id' | 'nome' | 'descricao' | 'categoriaPaiId'>
