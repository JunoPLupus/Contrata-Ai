import { Schema, model, Types } from "mongoose";

export interface IServicoDocument {
    id_prestador: Types.ObjectId,
    id_categoria: Types.ObjectId,
    descricao: string,
    preco_min?: number,
    preco_max?: number,
    prazo_medio_dias?: number,
    ativo: boolean
}

const ServicoSchema = new Schema<IServicoDocument>({
    id_prestador: { type: Types.ObjectId, ref: 'Prestador', required: true },
    id_categoria: { type: Types.ObjectId, ref: 'Categoria', required: true },
    descricao: { type: String, required: true },
    preco_min: Number,
    preco_max: Number,
    prazo_medio_dias: Number,
    ativo: { type: Boolean, default: true }
})

export const ServicoModel = model("Servico", ServicoSchema, "servicos")
