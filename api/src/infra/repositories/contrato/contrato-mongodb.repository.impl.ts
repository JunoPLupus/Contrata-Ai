import { IContratoRepository } from "../../../domain/repositories/contrato.repository";
import { Contrato } from "../../../domain/entities/contrato/contrato.entity";
import { IContratoDocument, ContratoModel } from "../../models/contrato/contrato.model";
import { ContratoMapper } from "./contrato.mapper";

export class ContratoMongodbRepositoryImpl implements IContratoRepository {
    public async buscarPorId(id: string): Promise<Contrato | null> {
        const documento = await ContratoModel.findById(id)
        if (!documento) return null

        return ContratoMapper.paraEntidade(documento)
    }

    public async buscarPorIdCliente(idCliente: string): Promise<Contrato[]> {
        const documentos = await ContratoModel.find({ id_cliente: idCliente })

        return documentos.map(doc => ContratoMapper.paraEntidade(doc))
    }

    public async buscarPorIdPrestador(idPrestador: string): Promise<Contrato[]> {
        const documentos = await ContratoModel.find({ id_prestador: idPrestador })

        return documentos.map(doc => ContratoMapper.paraEntidade(doc))
    }

    public async inserir(contrato: Contrato): Promise<Contrato> {
        const documento: IContratoDocument = ContratoMapper.paraDocumento(contrato)
        const documentoInserido = await ContratoModel.create(documento)

        return ContratoMapper.paraEntidade(documentoInserido)
    }

    public async atualizar(contrato: Contrato): Promise<Contrato> {
        const documento = await ContratoModel.findByIdAndUpdate(
            contrato.id,
            ContratoMapper.paraDocumento(contrato),
            { new: true }
        )

        return ContratoMapper.paraEntidade(documento!)
    }
}
