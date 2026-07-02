import { StringValueObject } from "../../value-objects/shared/string/string.vo";
import { StatusExtensaoPrazoValueObject } from "../../value-objects/extensao-prazo/status/status.vo";

export type ExtensaoPrazoProps = {
    id?: string
    idContrato: StringValueObject
    novoPrazo: Date
    justificativa: StringValueObject
    status: StatusExtensaoPrazoValueObject
    dataSolicitacao: Date
    dataResposta?: Date
}
