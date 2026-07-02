import { StringValueObject } from "../../value-objects/shared/string/string.vo";
import { StatusSolicitacaoValueObject } from "../../value-objects/solicitacao/status/status.vo";

export type SolicitacaoProps = {
    id?: string
    idCliente: StringValueObject
    idCategoria: StringValueObject
    idPrestadorDireto?: StringValueObject
    descricao: StringValueObject
    status: StatusSolicitacaoValueObject
    dataSolicitacao: Date
}
