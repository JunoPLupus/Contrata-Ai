import { ExtensaoPrazo } from "../entities/extensao-prazo/extensao-prazo.entity";
import { StringValueObject } from "../value-objects/shared/string/string.vo";
import { StatusExtensaoPrazoValueObject, StatusExtensaoPrazo, StatusExtensaoPrazoTipo } from "../value-objects/extensao-prazo/status/status.vo";

export class ExtensaoPrazoFactory {
    public static criar(dados: {
        id?: string
        idContrato: string
        novoPrazo: Date
        justificativa: string
        status?: StatusExtensaoPrazoTipo
        dataSolicitacao?: Date
        dataResposta?: Date
    }): ExtensaoPrazo {
        return ExtensaoPrazo.criarExtensaoPrazo({
            id: dados.id,
            idContrato: new StringValueObject('idContrato', dados.idContrato),
            novoPrazo: dados.novoPrazo,
            justificativa: new StringValueObject('justificativa', dados.justificativa, 5, 500),
            status: new StatusExtensaoPrazoValueObject(dados.status ?? StatusExtensaoPrazo.PENDENTE),
            dataSolicitacao: dados.dataSolicitacao ?? new Date(),
            dataResposta: dados.dataResposta,
        })
    }
}
