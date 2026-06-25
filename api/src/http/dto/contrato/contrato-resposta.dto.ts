import { Contrato } from "../../../domain/entities/contrato/contrato.entity";

export type ContratoRespostaDTO = Pick<
    Contrato,
    | 'id'
    | 'idSolicitacao'
    | 'idOrcamento'
    | 'idCliente'
    | 'idPrestador'
    | 'status'
    | 'dataAceite'
    | 'dataInicioEstimada'
    | 'prazoEstimado'
    | 'dataConclusao'
    | 'cienciaPagamento'
    | 'whatsappLiberado'
    | 'motivoCancelamento'
    | 'canceladoPor'
> & {
    whatsappPrestador?: string
}
