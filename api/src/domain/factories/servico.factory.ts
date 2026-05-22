import { Servico } from "../entities/servico/servico.entity";
import { IdPrestadorValueObject } from "../value-objects/prestador/idPrestador/id-prestador.vo";
import { IdCategoriaValueObject } from "../value-objects/categoria/idCategoria/id-categoria.vo";
import { DescricaoValueObject } from "../value-objects/servico/descricao/descricao.vo";
import { PrecoMinValueObject } from "../value-objects/servico/precoMin/preco-min.vo";
import { PrecoMaxValueObject } from "../value-objects/servico/precoMax/preco-max.vo";
import { PrazoMedioValueObject } from "../value-objects/servico/prazoMedio/prazo-medio.vo";

export class ServicoFactory {
    public static criar(dados: {
        id?: string,
        idPrestador: string,
        idCategoria: string,
        descricao: string,
        precoMin?: number,
        precoMax?: number,
        prazoMedioDias?: number,
        ativo: boolean
    }): Servico {
        return Servico.criarServico({
            id: dados.id,
            idPrestador: new IdPrestadorValueObject(dados.idPrestador),
            idCategoria: new IdCategoriaValueObject(dados.idCategoria),
            descricao: new DescricaoValueObject(dados.descricao),
            precoMin: dados.precoMin !== undefined ? new PrecoMinValueObject(dados.precoMin) : undefined,
            precoMax: dados.precoMax !== undefined ? new PrecoMaxValueObject(dados.precoMax) : undefined,
            prazoMedioDias: dados.prazoMedioDias !== undefined ? new PrazoMedioValueObject(dados.prazoMedioDias) : undefined,
            ativo: dados.ativo
        });
    }
}
