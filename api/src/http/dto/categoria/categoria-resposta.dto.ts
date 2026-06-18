import { Categoria } from "../../../domain/entities/categoria/categoria.entity";

export type CategoriaRespostaDTO = Pick<Categoria, 'id' | 'nome' | 'descricao'>
