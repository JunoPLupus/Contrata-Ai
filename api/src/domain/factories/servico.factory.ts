import { Servico } from "../entities/servico/servico.entity";
import { StringValueObject } from "../value-objects/shared/string/string.vo";
import { NumberValueObject } from "../value-objects/shared/number/number.vo";

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
            idPrestador: new StringValueObject('idPrestador', dados.idPrestador),
            idCategoria: new StringValueObject('idCategoria', dados.idCategoria),
            descricao: new StringValueObject('descricao', dados.descricao, 5, 500),
            precoMin: dados.precoMin !== undefined ? new NumberValueObject('precoMin', dados.precoMin, 1) : undefined,
            precoMax: dados.precoMax !== undefined ? new NumberValueObject('precoMax', dados.precoMax, 1) : undefined,
            prazoMedioDias: dados.prazoMedioDias !== undefined ? new NumberValueObject('prazoMedio', dados.prazoMedioDias, 1) : undefined,
            ativo: dados.ativo
        });
    }
}
