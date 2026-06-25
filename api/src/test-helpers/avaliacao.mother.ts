import { Types } from "mongoose";

import { Avaliacao } from "../domain/entities/avaliacao/avaliacao.entity";
import { AvaliacaoFactory } from "../domain/factories/avaliacao.factory";
import { IAvaliacaoRepository } from "../domain/repositories/avaliacao.repository";

export class AvaliacaoMother {
    public static criarValido(dados?: Partial<{
        id: string
        idContrato: string
        idCliente: string
        idPrestador: string
        nota: number
        comentario: string
        anonima: boolean
        dataCriacao: Date
        dataAtualizacao: Date
    }>): Avaliacao {
        return AvaliacaoFactory.criar({
            id: dados?.id ?? new Types.ObjectId().toString(),
            idContrato: dados?.idContrato ?? new Types.ObjectId().toString(),
            idCliente: dados?.idCliente ?? new Types.ObjectId().toString(),
            idPrestador: dados?.idPrestador ?? new Types.ObjectId().toString(),
            nota: dados?.nota ?? 5,
            comentario: dados?.comentario,
            anonima: dados?.anonima ?? false,
            dataCriacao: dados?.dataCriacao ?? new Date(),
            dataAtualizacao: dados?.dataAtualizacao,
        })
    }

    public static criarRepositoryMock(): jest.Mocked<IAvaliacaoRepository> {
        return {
            buscarPorId: jest.fn(),
            buscarPorIdContrato: jest.fn(),
            buscarPorIdCliente: jest.fn(),
            buscarPorIdPrestador: jest.fn(),
            inserir: jest.fn(),
            atualizar: jest.fn(),
            deletar: jest.fn(),
        }
    }
}
