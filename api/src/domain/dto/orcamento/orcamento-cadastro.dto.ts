import { Orcamento } from "../../entities/orcamento/orcamento.entity";

export type OrcamentoCadastroDTO = Pick<Orcamento, 'idSolicitacao' | 'idPrestador' | 'valor' | 'descricao'> & {
    prazoDias?: number
    idClienteDoPrestador?: string
}
