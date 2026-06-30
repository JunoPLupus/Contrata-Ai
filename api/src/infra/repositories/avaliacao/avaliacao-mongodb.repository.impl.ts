import { IAvaliacaoRepository } from "../../../domain/repositories/avaliacao.repository";
import { Avaliacao } from "../../../domain/entities/avaliacao/avaliacao.entity";
import { IAvaliacaoDocument, AvaliacaoModel } from "../../models/avaliacao/avaliacao.model";
import { AvaliacaoMapper } from "./avaliacao.mapper";

export class AvaliacaoMongodbRepositoryImpl implements IAvaliacaoRepository {
    public async buscarPorId(id: string): Promise<Avaliacao | null> {
        const documento = await AvaliacaoModel.findById(id)
        if (!documento) return null

        return AvaliacaoMapper.paraEntidade(documento)
    }

    public async buscarPorIdContrato(idContrato: string): Promise<Avaliacao | null> {
        const documento = await AvaliacaoModel.findOne({ id_contrato: idContrato })
        if (!documento) return null

        return AvaliacaoMapper.paraEntidade(documento)
    }

    public async buscarPorIdCliente(idCliente: string): Promise<Avaliacao[]> {
        const documentos = await AvaliacaoModel.find({ id_cliente: idCliente })

        return documentos.map(doc => AvaliacaoMapper.paraEntidade(doc))
    }

    public async buscarPorIdPrestador(idPrestador: string): Promise<Avaliacao[]> {
        const documentos = await AvaliacaoModel.find({ id_prestador: idPrestador })

        return documentos.map(doc => AvaliacaoMapper.paraEntidade(doc))
    }

    public async inserir(avaliacao: Avaliacao): Promise<Avaliacao> {
        const documento: IAvaliacaoDocument = AvaliacaoMapper.paraDocumento(avaliacao)
        const documentoInserido = await AvaliacaoModel.create(documento)

        return AvaliacaoMapper.paraEntidade(documentoInserido)
    }

    public async atualizar(avaliacao: Avaliacao): Promise<Avaliacao> {
        const documento = await AvaliacaoModel.findByIdAndUpdate(
            avaliacao.id,
            AvaliacaoMapper.paraDocumento(avaliacao),
            { new: true }
        )

        return AvaliacaoMapper.paraEntidade(documento!)
    }

    public async deletar(id: string): Promise<void> {
        await AvaliacaoModel.findByIdAndDelete(id)
    }
}
