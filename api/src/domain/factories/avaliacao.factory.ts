import { Avaliacao } from "../entities/avaliacao/avaliacao.entity";
import { StringValueObject } from "../value-objects/shared/string/string.vo";
import { NumberValueObject } from "../value-objects/shared/number/number.vo";

export class AvaliacaoFactory {
    public static criar(dados: {
        id?: string
        idContrato: string
        idCliente: string
        idPrestador: string
        nota: number
        comentario?: string
        anonima?: boolean
        dataCriacao?: Date
        dataAtualizacao?: Date
    }): Avaliacao {
        return Avaliacao.criarAvaliacao({
            id: dados.id,
            idContrato: new StringValueObject('idContrato', dados.idContrato),
            idCliente: new StringValueObject('idCliente', dados.idCliente),
            idPrestador: new StringValueObject('idPrestador', dados.idPrestador),
            nota: new NumberValueObject('nota', dados.nota, 1, 5),
            comentario: dados.comentario
                ? new StringValueObject('comentário', dados.comentario)
                : undefined,
            anonima: dados.anonima ?? false,
            dataCriacao: dados.dataCriacao ?? new Date(),
            dataAtualizacao: dados.dataAtualizacao,
        })
    }
}
