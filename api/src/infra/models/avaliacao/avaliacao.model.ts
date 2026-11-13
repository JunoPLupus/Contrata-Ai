import { Schema, model, Types } from "mongoose";

import { Papel, PapelTipo } from "../../../domain/value-objects/shared/papel/papel.vo";

/**
 * Nome do índice único `{ id_contrato, autor }` (no máx. 1 avaliação por contrato e direção).
 * Exportado para o `errorHandler` traduzir o E11000 deste índice numa mensagem específica.
 */
export const INDICE_AVALIACAO_CONTRATO_AUTOR = 'avaliacao_contrato_autor_unico'

export interface IAvaliacaoDocument {
    id_contrato: Types.ObjectId
    id_cliente: Types.ObjectId
    id_prestador: Types.ObjectId
    autor: PapelTipo
    nota: number
    comentario?: string
    anonima: boolean
    data_criacao: Date
    data_atualizacao?: Date
}

const AvaliacaoSchema = new Schema<IAvaliacaoDocument>({
    id_contrato: { type: Types.ObjectId, ref: 'Contrato', required: true },
    id_cliente: { type: Types.ObjectId, ref: 'Usuario', required: true },
    id_prestador: { type: Types.ObjectId, ref: 'Prestador', required: true },
    autor: { type: String, enum: Object.values(Papel), required: true },
    nota: { type: Number, required: true, min: 1, max: 5 },
    comentario: { type: String },
    anonima: { type: Boolean, required: true, default: false },
    data_criacao: { type: Date, required: true },
    data_atualizacao: { type: Date },
})

// O prefixo `id_contrato` também atende às buscas só por contrato.
AvaliacaoSchema.index({ id_contrato: 1, autor: 1 }, { unique: true, name: INDICE_AVALIACAO_CONTRATO_AUTOR })
AvaliacaoSchema.index({ id_prestador: 1 })
AvaliacaoSchema.index({ id_cliente: 1 })

export const AvaliacaoModel = model<IAvaliacaoDocument>('Avaliacao', AvaliacaoSchema, 'avaliacoes')
