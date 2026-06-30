import { Schema, model, Types } from "mongoose";
import { StatusOrcamento } from "../../../domain/value-objects/orcamento/status/status.vo";

export interface IOrcamentoDocument {
    id_solicitacao: Types.ObjectId
    id_prestador: Types.ObjectId
    valor: number
    prazo_dias: number
    status: string
    data_criacao: Date
    data_aceite?: Date
}

const OrcamentoSchema = new Schema<IOrcamentoDocument>({
    id_solicitacao: { type: Types.ObjectId, ref: 'Solicitacao', required: true },
    id_prestador: { type: Types.ObjectId, ref: 'Prestador', required: true },
    valor: { type: Number, required: true },
    prazo_dias: { type: Number, required: true, default: 15 },
    status: {
        type: String,
        enum: Object.values(StatusOrcamento),
        default: StatusOrcamento.PENDENTE,
        required: true
    },
    data_criacao: { type: Date, required: true, default: Date.now },
    data_aceite: { type: Date }
})

OrcamentoSchema.index({ id_solicitacao: 1, id_prestador: 1 }, { unique: true })

export const OrcamentoModel = model('Orcamento', OrcamentoSchema, 'orcamentos')
