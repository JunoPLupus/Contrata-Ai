import { Contrato } from "../../entities/contrato/contrato.entity";

export type ContratoAtualizacaoDTO = Partial<Pick<Contrato, 'dataInicioEstimada' | 'prazoEstimado'>>
