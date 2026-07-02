import { PipelineStage, Types } from "mongoose";

import { IPrestadorRepository } from "../../../domain/repositories/prestador.repository";
import { Prestador } from "../../../domain/entities/prestador/prestador.entity";
import { IPrestadorDocument, PrestadorModel } from "../../models/prestador/prestador.model";
import { PrestadorMapper } from "./prestador.mapper";
import { PrestadorBuscaResultado } from "../../../domain/dto/prestador/prestador-busca-resultado.dto";

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

    public async buscar(filtros: { idCategoria?: string; nomePrestador?: string }): Promise<PrestadorBuscaResultado[]> {
        const pipeline: PipelineStage[] = []

        pipeline.push({ $match: { ativo: true } })
        pipeline.push({ $lookup: { from: 'usuarios', localField: 'id_cliente', foreignField: '_id', as: 'usuario' } })
        pipeline.push({ $unwind: '$usuario' })

        if (filtros.nomePrestador) {
            pipeline.push({ $match: { 'usuario.nome': { $regex: filtros.nomePrestador, $options: 'i' } } })
        }

        if (filtros.idCategoria) {
            pipeline.push({ $lookup: { from: 'servicos', localField: '_id', foreignField: 'id_prestador', as: 'servicos' } })
            pipeline.push({ $match: { 'servicos.id_categoria': new Types.ObjectId(filtros.idCategoria) } })
        }

        pipeline.push({
            $project: {
                _id: 0,
                id: { $toString: '$_id' },
                descricao: 1,
                nome: '$usuario.nome',
                cidade: '$usuario.localizacao_cidade'
            }
        })

        return PrestadorModel.aggregate<PrestadorBuscaResultado>(pipeline)
    }

    public async buscarPorCidade(cidade: string): Promise<PrestadorBuscaResultado[]> {
        const cidadeEscapada = cidade.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

        const pipeline: PipelineStage[] = [
            { $match: { ativo: true } },
            { $lookup: { from: 'usuarios', localField: 'id_cliente', foreignField: '_id', as: 'usuario' } },
            { $unwind: '$usuario' },
            { $match: { 'usuario.localizacao_cidade': { $regex: `^${cidadeEscapada}$`, $options: 'i' } } },
            {
                $project: {
                    _id: 0,
                    id: { $toString: '$_id' },
                    descricao: 1,
                    nome: '$usuario.nome',
                    cidade: '$usuario.localizacao_cidade'
                }
            }
        ]

        return PrestadorModel.aggregate<PrestadorBuscaResultado>(pipeline)
    }
}
