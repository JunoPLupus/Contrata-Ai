import { IServicoRepository } from "../../../domain/repositories/servico.repository";
import { Servico } from "../../../domain/entities/servico/servico.entity";
import { IServicoDocument, ServicoModel } from "../../models/servico/servico.model";
import { ServicoMapper } from "./servico.mapper";

export class ServicoMongodbRepositoryImpl implements IServicoRepository {
    public async buscarPorId(id: string): Promise<Servico | null> {
        const documento = await ServicoModel.findById(id)
        if (!documento) return null

        return ServicoMapper.paraEntidade(documento)
    }

    public async buscarPorIdPrestador(idPrestador: string): Promise<Servico[]> {
        const documentos = await ServicoModel.find({ id_prestador: idPrestador })

        return documentos.map(doc => ServicoMapper.paraEntidade(doc))
    }

    public async inserir(servico: Servico): Promise<Servico> {
        const servicoDocumento: IServicoDocument = ServicoMapper.paraDocumento(servico)
        const documentoInserido = await ServicoModel.create(servicoDocumento)

        return ServicoMapper.paraEntidade(documentoInserido)
    }
}
