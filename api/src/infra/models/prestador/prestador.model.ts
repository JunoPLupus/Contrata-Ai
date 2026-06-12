import { Schema, model, Types } from "mongoose";

export interface IPrestadorDocument {
    id_cliente : Types.ObjectId,
    telefone ?: string,
    descricao ?: string,
    ativo : boolean,
    localizacao_latitude ?: number,
    localizacao_longitude ?: number
}

const PrestadorSchema = new Schema<IPrestadorDocument>({
    id_cliente : { type: Types.ObjectId, ref: 'Usuario', required: true, unique: true },
    telefone : String,
    descricao : String,
    ativo : { type: Boolean, default: true },
    localizacao_latitude : { type: Number, default: 0 },
    localizacao_longitude : { type: Number, default: 0 }
})

export const PrestadorModel = model("Prestador", PrestadorSchema, "prestadores")