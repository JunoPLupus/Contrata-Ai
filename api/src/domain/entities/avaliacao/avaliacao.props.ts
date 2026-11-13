import { StringValueObject } from "../../value-objects/shared/string/string.vo";
import { NumberValueObject } from "../../value-objects/shared/number/number.vo";
import { BooleanValueObject } from "../../value-objects/shared/boolean/boolean.vo";
import { PapelValueObject } from "../../value-objects/shared/papel/papel.vo";

export type AvaliacaoProps = {
    id?: string
    idContrato: StringValueObject
    idCliente: StringValueObject
    idPrestador: StringValueObject
    autor: PapelValueObject
    nota: NumberValueObject
    comentario?: StringValueObject
    anonima: BooleanValueObject
    dataCriacao: Date
    dataAtualizacao?: Date
}
