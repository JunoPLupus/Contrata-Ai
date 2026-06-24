import { ISolicitacaoRepository } from "../../../domain/repositories/solicitacao.repository";
import { Solicitacao } from "../../../domain/entities/solicitacao/solicitacao.entity";
import { ISolicitacaoDocument, SolicitacaoModel } from "../../models/solicitacao/solicitacao.model";
import { SolicitacaoMapper } from "./solicitacao.mapper";
import { StatusSolicitacao } from "../../../domain/value-objects/solicitacao/status/status.vo";

export class SolicitacaoMongodbRepositoryImpl implements ISolicitacaoRepository {
    public async buscarPorId(id: string): Promise<Solicitacao | null> {
        const documento = await SolicitacaoModel.findById(id)
        if (!documento) return null

        return SolicitacaoMapper.paraEntidade(documento)
    }

    public async buscarPorIdCliente(idCliente: string): Promise<Solicitacao[]> {
        const documentos = await SolicitacaoModel.find({ id_cliente: idCliente })

        return documentos.map(doc => SolicitacaoMapper.paraEntidade(doc))
    }

    public async buscarDisponiveisParaPrestador(
        idPrestador: string,
        idsCategorias: string[],
        idCategoria?: string
    ): Promise<Solicitacao[]> {
        const categoriasParaFiltro = idCategoria !== undefined ? [idCategoria] : idsCategorias

        const documentos = await SolicitacaoModel.find({
            status: StatusSolicitacao.ABERTA,
            id_categoria: { $in: categoriasParaFiltro },
            $or: [
                { id_prestador_direto: null },
                { id_prestador_direto: { $exists: false } },
                { id_prestador_direto: idPrestador }
            ]
        })

        return documentos.map(doc => SolicitacaoMapper.paraEntidade(doc))
    }

    public async inserir(solicitacao: Solicitacao): Promise<Solicitacao> {
        const documento: ISolicitacaoDocument = SolicitacaoMapper.paraDocumento(solicitacao)
        const documentoInserido = await SolicitacaoModel.create(documento)

        return SolicitacaoMapper.paraEntidade(documentoInserido)
    }

    public async atualizar(solicitacao: Solicitacao): Promise<Solicitacao> {
        const documento = await SolicitacaoModel.findByIdAndUpdate(
            solicitacao.id,
            SolicitacaoMapper.paraDocumento(solicitacao),
            { new: true }
        )

        return SolicitacaoMapper.paraEntidade(documento!)
    }
}
