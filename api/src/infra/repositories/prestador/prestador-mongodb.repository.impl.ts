import { Types } from "mongoose";

import { IPrestadorRepository } from "../../../domain/repositories/prestador.repository";
import { Prestador } from "../../../domain/entities/prestador/prestador.entity";
import { IPrestadorDocument, PrestadorModel } from "../../models/prestador/prestador.model";
import { PrestadorMapper } from "./prestador.mapper";

export class PrestadorMongodbRepositoryImpl implements IPrestadorRepository {
    public async inserir(prestador: Prestador): Promise<Prestador> {
        const prestadorDocumento : IPrestadorDocument = PrestadorMapper.paraDocumento(prestador)
        const documentoInserido = await PrestadorModel.create(prestadorDocumento)

        return PrestadorMapper.paraEntidade(documentoInserido)
    }

    public async buscarPorId(id: string): Promise<Prestador | null> {
        if (!Types.ObjectId.isValid(id)) return null

        const documento = await PrestadorModel.findById(id)
        if (!documento) return null

        return PrestadorMapper.paraEntidade(documento)
    }

    public async atualizar(prestador: Prestador): Promise<Prestador> {
        const prestadorDocumento : IPrestadorDocument = PrestadorMapper.paraDocumento(prestador)
        const documentoAtualizado = await PrestadorModel.findByIdAndUpdate(prestador.id, prestadorDocumento, { new: true })

        return PrestadorMapper.paraEntidade(documentoAtualizado!)
    }

    public async inativar(id: string): Promise<void> {
        await PrestadorModel.findByIdAndUpdate(id, { ativo: false })
    }

    public async ativar(id: string): Promise<void> {
        await PrestadorModel.findByIdAndUpdate(id, { ativo: true })
    }
}
