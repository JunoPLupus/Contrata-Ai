import { Servico } from "../entities/servico/servico.entity";
import { StringValueObject } from "../value-objects/shared/string/string.vo";
import { NumberValueObject } from "../value-objects/shared/number/number.vo";
import { IntegerValueObject } from "../value-objects/shared/integer/integer.vo";

export class ServicoFactory {
    public static criar(dados: {
        id?: string,
        idPrestador: string,
        idCategoria: string,
        titulo: string,
        descricao?: string,
        precoMin?: number,
        precoMax?: number,
        prazoMedioHoras?: number,
        ativo?: boolean
    }): Servico {
        return Servico.criarServico({
            id: dados.id,
            idPrestador: new StringValueObject('idPrestador', dados.idPrestador),
            idCategoria: new StringValueObject('idCategoria', dados.idCategoria),
            titulo: new StringValueObject('titulo', dados.titulo, 3, 80),
            descricao: dados.descricao !== undefined ? new StringValueObject('descricao', dados.descricao, 5, 500) : undefined,
            precoMin: dados.precoMin !== undefined ? new NumberValueObject('precoMin', dados.precoMin, 1) : undefined,
            precoMax: dados.precoMax !== undefined ? new NumberValueObject('precoMax', dados.precoMax, 1) : undefined,
            prazoMedioHoras: dados.prazoMedioHoras !== undefined ? new IntegerValueObject('prazoMedioHoras', dados.prazoMedioHoras, 1) : undefined,
            ativo: dados.ativo ?? true,
       })
    }
}
