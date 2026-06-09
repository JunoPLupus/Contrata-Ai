import { Schema, model, Types } from 'mongoose';

export interface IUsuarioDocument {
    nome: string
    email: string
    senha: string
    telefone?: string
    whatsapp?: string
    id_prestador?: Types.ObjectId
    localizacao_cidade?: string
    localizacao_cep?: string
    reputacao_flag_cancelamento: number
    data_cadastro: Date
    ativo: boolean
}

const usuarioSchema = new Schema<IUsuarioDocument>({
    nome: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    senha: { type: String, required: true },
    telefone: String,
    whatsapp: String,
    id_prestador: { type: Types.ObjectId, ref: 'Prestador' },
    localizacao_cidade: String,
    localizacao_cep: String,
    reputacao_flag_cancelamento: { type: Number, default: 0 },
    data_cadastro: { type: Date, default: Date.now },
    ativo: { type: Boolean, default: true },
})

export const UsuarioModel = model('Usuario', usuarioSchema)