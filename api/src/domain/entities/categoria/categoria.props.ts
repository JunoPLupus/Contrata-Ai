import { NomeValueObject } from "../../value-objects/shared/nome/nome.vo";

export type CategoriaProps = {
    id ?: string,
    categoriaPaiId ?: string,
    nome : NomeValueObject,
    descricao ?: string
}