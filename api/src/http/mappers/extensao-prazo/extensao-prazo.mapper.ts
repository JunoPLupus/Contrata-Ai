import { ExtensaoPrazo } from "../../../domain/entities/extensao-prazo/extensao-prazo.entity";
import { ExtensaoPrazoRespostaDTO } from "../../dto/extensao-prazo/extensao-prazo-resposta.dto";

export class ExtensaoPrazoMapper {
    public static paraRespostaDTO(extensao: ExtensaoPrazo): ExtensaoPrazoRespostaDTO {
        return {
            id: extensao.id,
            idContrato: extensao.idContrato,
            novoPrazo: extensao.novoPrazo,
            justificativa: extensao.justificativa,
            status: extensao.status,
            dataSolicitacao: extensao.dataSolicitacao,
            dataResposta: extensao.dataResposta,
        }
    }
}
