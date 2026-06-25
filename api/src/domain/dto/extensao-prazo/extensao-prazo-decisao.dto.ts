import { StatusExtensaoPrazoTipo } from "../../value-objects/extensao-prazo/status/status.vo";

export type ExtensaoPrazoDecisaoDTO = {
    decisao: Extract<StatusExtensaoPrazoTipo, 'aprovada' | 'recusada'>
}
