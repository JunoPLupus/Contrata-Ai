import { Orcamento } from "../entities/orcamento/orcamento.entity";
import { StringValueObject } from "../value-objects/shared/string/string.vo";
import { NumberValueObject } from "../value-objects/shared/number/number.vo";
import { StatusOrcamentoValueObject, StatusOrcamento, StatusOrcamentoTipo } from "../value-objects/orcamento/status/status.vo";

export class OrcamentoFactory {
    public static criar(dados: {
        id?: string
        idSolicitacao: string
        idPrestador: string
        valor: number
        prazoDias?: number
        status?: StatusOrcamentoTipo
        dataCriacao?: Date
        dataAceite?: Date
    }): Orcamento {
        return Orcamento.criarOrcamento({
            id: dados.id,
            idSolicitacao: new StringValueObject('idSolicitacao', dados.idSolicitacao),
            idPrestador: new StringValueObject('idPrestador', dados.idPrestador),
            valor: new NumberValueObject('valor', dados.valor, 1),
            prazoDias: new NumberValueObject('prazoDias', dados.prazoDias ?? 15, 1),
            status: new StatusOrcamentoValueObject(dados.status ?? StatusOrcamento.PENDENTE),
            dataCriacao: dados.dataCriacao ?? new Date(),
            dataAceite: dados.dataAceite
        })
    }
}
