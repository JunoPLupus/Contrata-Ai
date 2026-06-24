import { StringValueObject } from "../../value-objects/shared/string/string.vo";
import { NumberValueObject } from "../../value-objects/shared/number/number.vo";

export type ServicoProps = {
    id ?: string,
    idPrestador : StringValueObject,
    idCategoria : StringValueObject,
    descricao : StringValueObject,
    precoMin ?: NumberValueObject,
    precoMax ?: NumberValueObject,
    prazoMedioDias ?: NumberValueObject
}
