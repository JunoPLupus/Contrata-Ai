import { IOrcamentoRepository } from "../../../domain/repositories/orcamento.repository";
import { Orcamento } from "../../../domain/entities/orcamento/orcamento.entity";
import { IOrcamentoDocument, OrcamentoModel } from "../../models/orcamento/orcamento.model";
import { OrcamentoMapper } from "./orcamento.mapper";

export class OrcamentoMongodbRepositoryImpl implements IOrcamentoRepository {
    public async buscarPorId(id: string): Promise<Orcamento | null> {
        const documento = await OrcamentoModel.findById(id)
        if (!documento) return null

        return OrcamentoMapper.paraEntidade(documento)
    }

    public async buscarPorIdPrestador(idPrestador: string): Promise<Orcamento[]> {
        const documentos = await OrcamentoModel.find({ id_prestador: idPrestador })

        return documentos.map(doc => OrcamentoMapper.paraEntidade(doc))
    }

    public async buscarPorIdSolicitacao(idSolicitacao: string): Promise<Orcamento[]> {
        const documentos = await OrcamentoModel.find({ id_solicitacao: idSolicitacao })

        return documentos.map(doc => OrcamentoMapper.paraEntidade(doc))
    }

    public async inserir(orcamento: Orcamento): Promise<Orcamento> {
        const documento: IOrcamentoDocument = OrcamentoMapper.paraDocumento(orcamento)
        const documentoInserido = await OrcamentoModel.create(documento)

        return OrcamentoMapper.paraEntidade(documentoInserido)
    }

    public async atualizar(orcamento: Orcamento): Promise<Orcamento> {
        const documento = await OrcamentoModel.findByIdAndUpdate(
            orcamento.id,
            OrcamentoMapper.paraDocumento(orcamento),
            { new: true }
        )

        return OrcamentoMapper.paraEntidade(documento!)
    }
}
