import { Schema, model, Types } from "mongoose";
import { StatusExtensaoPrazo } from "../../../domain/value-objects/extensao-prazo/status/status.vo";

export interface IExtensaoPrazoDocument {
    id_contrato: Types.ObjectId
    novo_prazo: Date
    justificativa: string
    status: string
    data_solicitacao: Date
    data_resposta?: Date
}

const ExtensaoPrazoSchema = new Schema<IExtensaoPrazoDocument>({
    id_contrato: { type: Types.ObjectId, ref: 'Contrato', required: true },
    novo_prazo: { type: Date, required: true },
    justificativa: { type: String, required: true },
    status: {
        type: String,
        enum: Object.values(StatusExtensaoPrazo),
        default: StatusExtensaoPrazo.PENDENTE,
        required: true
    },
    data_solicitacao: { type: Date, required: true, default: Date.now },
    data_resposta: { type: Date },
})

ExtensaoPrazoSchema.index({ id_contrato: 1 })

export const ExtensaoPrazoModel = model('ExtensaoPrazo', ExtensaoPrazoSchema, 'extensoes_prazo')
