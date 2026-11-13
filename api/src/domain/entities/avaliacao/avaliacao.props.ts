import { StringValueObject } from "../../value-objects/shared/string/string.vo";
import { NumberValueObject } from "../../value-objects/shared/number/number.vo";
import { BooleanValueObject } from "../../value-objects/shared/boolean/boolean.vo";

export type AvaliacaoProps = {
    id?: string
    idContrato: StringValueObject
    idCliente: StringValueObject
    idPrestador: StringValueObject
    nota: NumberValueObject
    comentario?: StringValueObject
    anonima: BooleanValueObject
    dataCriacao: Date
    dataAtualizacao?: Date
}
