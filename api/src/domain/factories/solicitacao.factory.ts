import { Solicitacao } from "../entities/solicitacao/solicitacao.entity";
import { StringValueObject } from "../value-objects/shared/string/string.vo";
import { StatusSolicitacaoValueObject, StatusSolicitacao, StatusSolicitacaoTipo } from "../value-objects/solicitacao/status/status.vo";

export class SolicitacaoFactory {
    public static criar(dados: {
        id?: string
        idCliente: string
        idCategoria: string
        idPrestadorDireto?: string
        descricao: string
        status?: StatusSolicitacaoTipo
        dataSolicitacao?: Date
    }): Solicitacao {
        return Solicitacao.criarSolicitacao({
            id: dados.id,
            idCliente: new StringValueObject('idCliente', dados.idCliente),
            idCategoria: new StringValueObject('categoria', dados.idCategoria),
            idPrestadorDireto: dados.idPrestadorDireto !== undefined
                ? new StringValueObject('prestador', dados.idPrestadorDireto)
                : undefined,
            descricao: new StringValueObject('descricao', dados.descricao, 5, 300),
            status: new StatusSolicitacaoValueObject(dados.status ?? StatusSolicitacao.ABERTA),
            dataSolicitacao: dados.dataSolicitacao ?? new Date()
        })
    }
}
