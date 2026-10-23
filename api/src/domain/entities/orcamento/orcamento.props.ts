import { StringValueObject } from "../../value-objects/shared/string/string.vo";
import { NumberValueObject } from "../../value-objects/shared/number/number.vo";
import { IntegerValueObject } from "../../value-objects/shared/integer/integer.vo";
import { StatusOrcamentoValueObject } from "../../value-objects/orcamento/status/status.vo";

export type OrcamentoProps = {
    id?: string
    idSolicitacao: StringValueObject
    idPrestador: StringValueObject
    valorEstimado: NumberValueObject
    descricao?: StringValueObject
    prazoEstimadoHoras: IntegerValueObject
    status: StatusOrcamentoValueObject
    dataCriacao: Date
    dataAceite?: Date
}
