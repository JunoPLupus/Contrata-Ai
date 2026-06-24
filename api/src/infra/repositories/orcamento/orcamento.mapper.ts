import { HydratedDocument, Types } from "mongoose";

import { IOrcamentoDocument } from "../../models/orcamento/orcamento.model";
import { Orcamento } from "../../../domain/entities/orcamento/orcamento.entity";
import { OrcamentoFactory } from "../../../domain/factories/orcamento.factory";
import { StatusOrcamentoTipo } from "../../../domain/value-objects/orcamento/status/status.vo";

export class OrcamentoMapper {
    public static paraEntidade(doc: HydratedDocument<IOrcamentoDocument>): Orcamento {
        return OrcamentoFactory.criar({
            id: doc.id.toString(),
            idSolicitacao: doc.id_solicitacao.toString(),
            idPrestador: doc.id_prestador.toString(),
            valor: doc.valor,
            prazoDias: doc.prazo_dias,
            status: doc.status as StatusOrcamentoTipo,
            dataCriacao: doc.data_criacao,
            dataAceite: doc.data_aceite
        })
    }

    public static paraDocumento(orcamento: Orcamento): IOrcamentoDocument {
        return {
            id_solicitacao: new Types.ObjectId(orcamento.idSolicitacao),
            id_prestador: new Types.ObjectId(orcamento.idPrestador),
            valor: orcamento.valor,
            prazo_dias: orcamento.prazoDias,
            status: orcamento.status,
            data_criacao: orcamento.dataCriacao,
            data_aceite: orcamento.dataAceite
        }
    }
}
