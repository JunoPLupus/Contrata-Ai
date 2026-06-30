import { HydratedDocument, Types } from "mongoose";

import { IServicoDocument } from "../../models/servico/servico.model";
import { Servico } from "../../../domain/entities/servico/servico.entity";
import { ServicoFactory } from "../../../domain/factories/servico.factory";

export class ServicoMapper {
    public static paraEntidade(doc: HydratedDocument<IServicoDocument>): Servico {
        return ServicoFactory.criar({
            id: doc.id.toString(),
            idPrestador: doc.id_prestador.toString(),
            idCategoria: doc.id_categoria.toString(),
            descricao: doc.descricao,
            precoMin: doc.preco_min,
            precoMax: doc.preco_max,
            prazoMedioDias: doc.prazo_medio_dias
        })
    }

    public static paraDocumento(servico: Servico): IServicoDocument {
        return {
            id_prestador: new Types.ObjectId(servico.idPrestador),
            id_categoria: new Types.ObjectId(servico.idCategoria),
            descricao: servico.descricao,
            preco_min: servico.precoMin,
            preco_max: servico.precoMax,
            prazo_medio_dias: servico.prazoMedioDias
        }
    }
}
