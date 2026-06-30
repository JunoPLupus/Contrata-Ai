import { HydratedDocument, Types } from "mongoose";

import { IExtensaoPrazoDocument } from "../../models/extensao-prazo/extensao-prazo.model";
import { ExtensaoPrazo } from "../../../domain/entities/extensao-prazo/extensao-prazo.entity";
import { ExtensaoPrazoFactory } from "../../../domain/factories/extensao-prazo.factory";
import { StatusExtensaoPrazoTipo } from "../../../domain/value-objects/extensao-prazo/status/status.vo";

export class ExtensaoPrazoMapper {
    public static paraEntidade(doc: HydratedDocument<IExtensaoPrazoDocument>): ExtensaoPrazo {
        return ExtensaoPrazoFactory.criar({
            id: doc.id.toString(),
            idContrato: doc.id_contrato.toString(),
            novoPrazo: doc.novo_prazo,
            justificativa: doc.justificativa,
            status: doc.status as StatusExtensaoPrazoTipo,
            dataSolicitacao: doc.data_solicitacao,
            dataResposta: doc.data_resposta,
        })
    }

    public static paraDocumento(extensao: ExtensaoPrazo): IExtensaoPrazoDocument {
        return {
            id_contrato: new Types.ObjectId(extensao.idContrato),
            novo_prazo: extensao.novoPrazo,
            justificativa: extensao.justificativa,
            status: extensao.status,
            data_solicitacao: extensao.dataSolicitacao,
            data_resposta: extensao.dataResposta,
        }
    }
}
