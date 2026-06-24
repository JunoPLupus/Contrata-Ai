import { HydratedDocument, Types } from "mongoose";

import { ISolicitacaoDocument } from "../../models/solicitacao/solicitacao.model";
import { Solicitacao } from "../../../domain/entities/solicitacao/solicitacao.entity";
import { SolicitacaoFactory } from "../../../domain/factories/solicitacao.factory";
import { StatusSolicitacaoTipo } from "../../../domain/value-objects/solicitacao/status/status.vo";

export class SolicitacaoMapper {
    public static paraEntidade(doc: HydratedDocument<ISolicitacaoDocument>): Solicitacao {
        return SolicitacaoFactory.criar({
            id: doc.id.toString(),
            idCliente: doc.id_cliente.toString(),
            idCategoria: doc.id_categoria.toString(),
            idPrestadorDireto: doc.id_prestador_direto?.toString(),
            descricao: doc.descricao,
            status: doc.status as StatusSolicitacaoTipo,
            dataSolicitacao: doc.data_solicitacao
        })
    }

    public static paraDocumento(solicitacao: Solicitacao): ISolicitacaoDocument {
        return {
            id_cliente: new Types.ObjectId(solicitacao.idCliente),
            id_categoria: new Types.ObjectId(solicitacao.idCategoria),
            id_prestador_direto: solicitacao.idPrestadorDireto !== undefined
                ? new Types.ObjectId(solicitacao.idPrestadorDireto)
                : undefined,
            descricao: solicitacao.descricao,
            status: solicitacao.status,
            data_solicitacao: solicitacao.dataSolicitacao
        }
    }
}
