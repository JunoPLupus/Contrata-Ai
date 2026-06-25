import { ExtensaoPrazo } from "../../../domain/entities/extensao-prazo/extensao-prazo.entity";

export type ExtensaoPrazoRespostaDTO = Pick<
    ExtensaoPrazo,
    | 'id'
    | 'idContrato'
    | 'novoPrazo'
    | 'justificativa'
    | 'status'
    | 'dataSolicitacao'
    | 'dataResposta'
>
