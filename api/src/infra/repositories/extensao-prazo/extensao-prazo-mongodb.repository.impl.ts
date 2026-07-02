import { IExtensaoPrazoRepository } from "../../../domain/repositories/extensao-prazo.repository";
import { ExtensaoPrazo } from "../../../domain/entities/extensao-prazo/extensao-prazo.entity";
import { IExtensaoPrazoDocument, ExtensaoPrazoModel } from "../../models/extensao-prazo/extensao-prazo.model";
import { ExtensaoPrazoMapper } from "./extensao-prazo.mapper";

export class ExtensaoPrazoMongodbRepositoryImpl implements IExtensaoPrazoRepository {
    public async buscarPorId(id: string): Promise<ExtensaoPrazo | null> {
        const documento = await ExtensaoPrazoModel.findById(id)
        if (!documento) return null

        return ExtensaoPrazoMapper.paraEntidade(documento)
    }

    public async inserir(extensao: ExtensaoPrazo): Promise<ExtensaoPrazo> {
        const documento: IExtensaoPrazoDocument = ExtensaoPrazoMapper.paraDocumento(extensao)
        const documentoInserido = await ExtensaoPrazoModel.create(documento)

        return ExtensaoPrazoMapper.paraEntidade(documentoInserido)
    }

    public async atualizar(extensao: ExtensaoPrazo): Promise<ExtensaoPrazo> {
        const documento = await ExtensaoPrazoModel.findByIdAndUpdate(
            extensao.id,
            ExtensaoPrazoMapper.paraDocumento(extensao),
            { new: true }
        )

        return ExtensaoPrazoMapper.paraEntidade(documento!)
    }
}
