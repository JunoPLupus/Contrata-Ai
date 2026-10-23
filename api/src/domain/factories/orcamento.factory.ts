import { Orcamento } from "../entities/orcamento/orcamento.entity";
import { StringValueObject } from "../value-objects/shared/string/string.vo";
import { NumberValueObject } from "../value-objects/shared/number/number.vo";
import { IntegerValueObject } from "../value-objects/shared/integer/integer.vo";
import { StatusOrcamentoValueObject, StatusOrcamento, StatusOrcamentoTipo } from "../value-objects/orcamento/status/status.vo";

export class OrcamentoFactory {
    public static criar(dados: {
        id?: string
        idSolicitacao: string
        idPrestador: string
        valorEstimado: number
        descricao?: string
        prazoEstimadoHoras: number
        status?: StatusOrcamentoTipo
        dataCriacao?: Date
        dataAceite?: Date
    }): Orcamento {
        return Orcamento.criarOrcamento({
            id: dados.id,
            idSolicitacao: new StringValueObject('idSolicitação', dados.idSolicitacao),
            idPrestador: new StringValueObject('idPrestador', dados.idPrestador),
            valorEstimado: new NumberValueObject('valorEstimado', dados.valorEstimado, 1),
            descricao: dados.descricao !== undefined ? new StringValueObject('descricao', dados.descricao, 5, 500) : undefined,
            prazoEstimadoHoras: new IntegerValueObject('prazoEstimadoHoras', dados.prazoEstimadoHoras, 1),
            status: new StatusOrcamentoValueObject(dados.status ?? StatusOrcamento.PENDENTE),
            dataCriacao: dados.dataCriacao ?? new Date(),
            dataAceite: dados.dataAceite
        })
    }
}
