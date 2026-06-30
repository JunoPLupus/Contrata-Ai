import { Schema, model, Types } from "mongoose";
import { StatusContrato } from "../../../domain/value-objects/contrato/status/status.vo";
import { TipoProblema } from "../../../domain/value-objects/contrato/problema/tipo-problema.vo";

export interface IContratoDocument {
    id_solicitacao: Types.ObjectId
    id_orcamento: Types.ObjectId
    id_cliente: Types.ObjectId
    id_prestador: Types.ObjectId
    status: string
    data_aceite: Date
    data_inicio_estimada?: Date
    prazo_estimado?: Date
    data_conclusao?: Date
    ciencia_pagamento: boolean
    whatsapp_liberado: boolean
    motivo_cancelamento?: string
    cancelado_por?: Types.ObjectId
    problema?: { tipo: string; descricao: string; data_criacao: Date }
}

const ContratoSchema = new Schema<IContratoDocument>({
    id_solicitacao: { type: Types.ObjectId, ref: 'Solicitacao', required: true },
    id_orcamento: { type: Types.ObjectId, ref: 'Orcamento', required: true },
    id_cliente: { type: Types.ObjectId, ref: 'Usuario', required: true },
    id_prestador: { type: Types.ObjectId, ref: 'Prestador', required: true },
    status: {
        type: String,
        enum: Object.values(StatusContrato),
        default: StatusContrato.AGUARDANDO_INICIO,
        required: true
    },
    data_aceite: { type: Date, required: true },
    data_inicio_estimada: { type: Date },
    prazo_estimado: { type: Date },
    data_conclusao: { type: Date },
    ciencia_pagamento: { type: Boolean, required: true, default: false },
    whatsapp_liberado: { type: Boolean, required: true, default: false },
    motivo_cancelamento: { type: String },
    cancelado_por: { type: Types.ObjectId, ref: 'Usuario' },
    problema: {
        type: {
            tipo: { type: String, enum: Object.values(TipoProblema) },
            descricao: { type: String },
            data_criacao: { type: Date },
        },
        _id: false,
    },
})

export const ContratoModel = model('Contrato', ContratoSchema, 'contratos')
