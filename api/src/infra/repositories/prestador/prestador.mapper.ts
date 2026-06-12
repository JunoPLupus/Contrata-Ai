import { HydratedDocument, Types } from "mongoose";

import { IPrestadorDocument } from "../../models/prestador/prestador.model";
import { Prestador } from "../../../domain/entities/prestador/prestador.entity";
import { PrestadorFactory } from "../../../domain/factories/prestador.factory";

export class PrestadorMapper {
    public static paraEntidade(doc : HydratedDocument<IPrestadorDocument>) : Prestador{
        return PrestadorFactory.criar({
            id : doc.id.toString(),
            idCliente : doc.id_cliente.toString(),
            telefone : doc.telefone,
            descricao : doc.descricao,
            ativo : doc.ativo
        })
    }
    public static paraDocumento(prestador : Prestador) : IPrestadorDocument {
        return {
            id_cliente : new Types.ObjectId(prestador.idCliente),
            telefone : prestador.telefone,
            descricao : prestador.descricao,
            ativo : prestador.ativo
        }
    }
}