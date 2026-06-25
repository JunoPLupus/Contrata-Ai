import { Schema, model, Types } from "mongoose";

export interface IAvaliacaoDocument {
    id_contrato: Types.ObjectId
    id_cliente: Types.ObjectId
    id_prestador: Types.ObjectId
    nota: number
    comentario?: string
    anonima: boolean
    data_criacao: Date
    data_atualizacao?: Date
}

const AvaliacaoSchema = new Schema<IAvaliacaoDocument>({
    id_contrato: { type: Types.ObjectId, ref: 'Contrato', required: true, unique: true },
    id_cliente: { type: Types.ObjectId, ref: 'Usuario', required: true },
    id_prestador: { type: Types.ObjectId, ref: 'Prestador', required: true },
    nota: { type: Number, required: true, min: 1, max: 5 },
    comentario: { type: String },
    anonima: { type: Boolean, required: true, default: false },
    data_criacao: { type: Date, required: true },
    data_atualizacao: { type: Date },
})

AvaliacaoSchema.index({ id_prestador: 1 })
AvaliacaoSchema.index({ id_cliente: 1 })

export const AvaliacaoModel = model<IAvaliacaoDocument>('Avaliacao', AvaliacaoSchema, 'avaliacoes')
