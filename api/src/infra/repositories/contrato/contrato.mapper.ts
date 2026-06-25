import { HydratedDocument, Types } from "mongoose";

import { IContratoDocument } from "../../models/contrato/contrato.model";
import { Contrato } from "../../../domain/entities/contrato/contrato.entity";
import { ContratoFactory } from "../../../domain/factories/contrato.factory";
import { StatusContratoTipo } from "../../../domain/value-objects/contrato/status/status.vo";

export class ContratoMapper {
    public static paraEntidade(doc: HydratedDocument<IContratoDocument>): Contrato {
        return ContratoFactory.criar({
            id: doc.id.toString(),
            idSolicitacao: doc.id_solicitacao.toString(),
            idOrcamento: doc.id_orcamento.toString(),
            idCliente: doc.id_cliente.toString(),
            idPrestador: doc.id_prestador.toString(),
            status: doc.status as StatusContratoTipo,
            dataAceite: doc.data_aceite,
            dataInicioEstimada: doc.data_inicio_estimada,
            prazoEstimado: doc.prazo_estimado,
            dataConclusao: doc.data_conclusao,
            cienciaPagamento: doc.ciencia_pagamento,
            whatsappLiberado: doc.whatsapp_liberado,
            motivoCancelamento: doc.motivo_cancelamento,
            canceladoPor: doc.cancelado_por?.toString(),
        })
    }

    public static paraDocumento(contrato: Contrato): IContratoDocument {
        return {
            id_solicitacao: new Types.ObjectId(contrato.idSolicitacao),
            id_orcamento: new Types.ObjectId(contrato.idOrcamento),
            id_cliente: new Types.ObjectId(contrato.idCliente),
            id_prestador: new Types.ObjectId(contrato.idPrestador),
            status: contrato.status,
            data_aceite: contrato.dataAceite,
            data_inicio_estimada: contrato.dataInicioEstimada,
            prazo_estimado: contrato.prazoEstimado,
            data_conclusao: contrato.dataConclusao,
            ciencia_pagamento: contrato.cienciaPagamento,
            whatsapp_liberado: contrato.whatsappLiberado,
            motivo_cancelamento: contrato.motivoCancelamento,
            cancelado_por: contrato.canceladoPor ? new Types.ObjectId(contrato.canceladoPor) : undefined,
        }
    }
}
