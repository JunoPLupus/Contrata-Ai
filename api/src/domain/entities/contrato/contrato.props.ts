import { StringValueObject } from "../../value-objects/shared/string/string.vo";
import { StatusContratoValueObject } from "../../value-objects/contrato/status/status.vo";

export type ContratoProps = {
    id?: string
    idSolicitacao: StringValueObject
    idOrcamento: StringValueObject
    idCliente: StringValueObject
    idPrestador: StringValueObject
    status: StatusContratoValueObject
    dataAceite: Date
    dataInicioEstimada?: Date
    prazoEstimado?: Date
    dataConclusao?: Date
    cienciaPagamento: boolean
    whatsappLiberado: boolean
    motivoCancelamento?: string
    canceladoPor?: string
}
