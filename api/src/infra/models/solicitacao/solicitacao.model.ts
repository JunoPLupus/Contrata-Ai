import { Schema, model, Types } from "mongoose";
import { StatusSolicitacao } from "../../../domain/value-objects/solicitacao/status/status.vo";

export interface ISolicitacaoDocument {
    id_cliente: Types.ObjectId
    id_categoria: Types.ObjectId
    id_prestador_direto?: Types.ObjectId
    descricao: string
    status: string
    data_solicitacao: Date
}

const SolicitacaoSchema = new Schema<ISolicitacaoDocument>({
    id_cliente: { type: Types.ObjectId, ref: 'Usuario', required: true },
    id_categoria: { type: Types.ObjectId, ref: 'Categoria', required: true },
    id_prestador_direto: { type: Types.ObjectId, ref: 'Prestador' },
    descricao: { type: String, required: true },
    status: {
        type: String,
        enum: Object.values(StatusSolicitacao),
        default: StatusSolicitacao.ABERTA,
        required: true
    },
    data_solicitacao: { type: Date, required: true, default: Date.now }
})

export const SolicitacaoModel = model('Solicitacao', SolicitacaoSchema, 'solicitacoes')
