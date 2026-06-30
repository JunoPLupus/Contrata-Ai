import { Schema, model, Types } from "mongoose";

export interface ICategoriaDocument {
    categoria_pai_id?: Types.ObjectId,
    nome: string,
    descricao?: string
}

const CategoriaSchema = new Schema<ICategoriaDocument>({
    categoria_pai_id: { type: Types.ObjectId, ref: 'Categoria' },
    nome: { type: String, required: true },
    descricao: String
})

export const CategoriaModel = model("Categoria", CategoriaSchema, "categorias")
