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

    public async atualizar(servico: Servico): Promise<Servico> {
        const servicoDocumento: IServicoDocument = ServicoMapper.paraDocumento(servico)
        // O Mongoose ignora chaves `undefined` no update; campos opcionais removidos na entidade viram $unset
        const camposRemovidos = Object.keys(servicoDocumento)
            .filter(campo => servicoDocumento[campo as keyof IServicoDocument] === undefined)

        const documento = await ServicoModel.findByIdAndUpdate(
            servico.id,
            { ...servicoDocumento, $unset: Object.fromEntries(camposRemovidos.map(campo => [campo, 1])) },
            { new: true }
        )

        return ServicoMapper.paraEntidade(documento!)
    }

    public async deletar(id: string): Promise<void> {
        await ServicoModel.findByIdAndDelete(id)
    }
}
