import { StringValueObject } from "../../value-objects/shared/string/string.vo";
import { NumberValueObject } from "../../value-objects/shared/number/number.vo";
import { StatusOrcamentoValueObject } from "../../value-objects/orcamento/status/status.vo";

export type OrcamentoProps = {
    id?: string
    idSolicitacao: StringValueObject
    idPrestador: StringValueObject
    valor: NumberValueObject
    prazoDias: NumberValueObject
    status: StatusOrcamentoValueObject
    dataCriacao: Date
    dataAceite?: Date
}
