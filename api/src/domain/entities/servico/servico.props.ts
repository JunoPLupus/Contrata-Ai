import { StringValueObject } from "../../value-objects/shared/string/string.vo";
import { NumberValueObject } from "../../value-objects/shared/number/number.vo";
import { IntegerValueObject } from "../../value-objects/shared/integer/integer.vo";

export type ServicoProps = {
    id ?: string,
    idPrestador : StringValueObject,
    idCategoria : StringValueObject,
    descricao : StringValueObject,
    precoMin ?: NumberValueObject,
    precoMax ?: NumberValueObject,
    prazoMedioHoras ?: IntegerValueObject
}
