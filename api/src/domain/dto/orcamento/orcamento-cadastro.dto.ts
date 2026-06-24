import { Orcamento } from "../../entities/orcamento/orcamento.entity";

export type OrcamentoCadastroDTO = Pick<Orcamento, 'idSolicitacao' | 'idPrestador' | 'valor'> & {
    prazoDias?: number
    idClienteDoPrestador?: string
}
