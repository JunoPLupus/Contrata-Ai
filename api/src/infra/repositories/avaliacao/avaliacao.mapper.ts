import { HydratedDocument, Types } from "mongoose";

import { IAvaliacaoDocument } from "../../models/avaliacao/avaliacao.model";
import { Avaliacao } from "../../../domain/entities/avaliacao/avaliacao.entity";
import { AvaliacaoFactory } from "../../../domain/factories/avaliacao.factory";

export class AvaliacaoMapper {
    public static paraEntidade(doc: HydratedDocument<IAvaliacaoDocument>): Avaliacao {
        return AvaliacaoFactory.criar({
            id: doc.id.toString(),
            idContrato: doc.id_contrato.toString(),
            idCliente: doc.id_cliente.toString(),
            idPrestador: doc.id_prestador.toString(),
            nota: doc.nota,
            comentario: doc.comentario,
            anonima: doc.anonima,
            dataCriacao: doc.data_criacao,
            dataAtualizacao: doc.data_atualizacao,
        })
    }

    public static paraDocumento(avaliacao: Avaliacao): IAvaliacaoDocument {
        return {
            id_contrato: new Types.ObjectId(avaliacao.idContrato),
            id_cliente: new Types.ObjectId(avaliacao.idCliente),
            id_prestador: new Types.ObjectId(avaliacao.idPrestador),
            nota: avaliacao.nota,
            comentario: avaliacao.comentario,
            anonima: avaliacao.anonima,
            data_criacao: avaliacao.dataCriacao,
            data_atualizacao: avaliacao.dataAtualizacao,
        }
    }
}
