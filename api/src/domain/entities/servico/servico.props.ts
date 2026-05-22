import { IdPrestadorValueObject } from "../../value-objects/prestador/idPrestador/id-prestador.vo";
import { IdCategoriaValueObject } from "../../value-objects/categoria/idCategoria/id-categoria.vo";
import { DescricaoValueObject } from "../../value-objects/servico/descricao/descricao.vo";
import { PrecoMinValueObject } from "../../value-objects/servico/precoMin/preco-min.vo";
import { PrecoMaxValueObject } from "../../value-objects/servico/precoMax/preco-max.vo";
import { PrazoMedioValueObject } from "../../value-objects/servico/prazoMedio/prazo-medio.vo";

export type ServicoProps = {
    id ?: string,
    idPrestador : IdPrestadorValueObject,
    idCategoria : IdCategoriaValueObject,
    descricao : DescricaoValueObject,
    precoMin ?: PrecoMinValueObject,
    precoMax ?: PrecoMaxValueObject,
    prazoMedioDias ?: PrazoMedioValueObject,
    ativo : boolean
}