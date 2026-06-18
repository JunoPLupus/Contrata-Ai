import { Types } from "mongoose";

import { Servico } from "../domain/entities/servico/servico.entity";
import { ServicoFactory } from "../domain/factories/servico.factory";
import { ServicoCadastroDTO } from "../domain/dto/servico/servico-cadastro.dto";
import {IServicoRepository} from "../domain/repositories/servico.repository";

export class ServicoMother {
    public static criarValido(dados?: Partial<{
        idPrestador: string,
        idCategoria: string,
        descricao: string,
        precoMin: number,
        precoMax: number,
        prazoMedioDias: number
    }>): Servico {
        return ServicoFactory.criar({
            idPrestador: dados?.idPrestador ?? new Types.ObjectId().toString(),
            idCategoria: dados?.idCategoria ?? new Types.ObjectId().toString(),
            descricao: dados?.descricao ?? 'Instalacao eletrica residencial',
            precoMin: dados?.precoMin,
            precoMax: dados?.precoMax,
            prazoMedioDias: dados?.prazoMedioDias
        })
    }

    public static criarDTO(dados?: Partial<ServicoCadastroDTO>): ServicoCadastroDTO {
        return {
            idPrestador: dados?.idPrestador ?? new Types.ObjectId().toString(),
            idCategoria: dados?.idCategoria ?? new Types.ObjectId().toString(),
            descricao: dados?.descricao ?? 'Instalacao eletrica residencial',
            precoMin: dados?.precoMin,
            precoMax: dados?.precoMax,
            prazoMedioDias: dados?.prazoMedioDias
        }
    }

    public static criarRepositoryMock() : jest.Mocked<IServicoRepository> {
        return {
            buscarPorId: jest.fn(),
            buscarPorIdPrestador: jest.fn(),
            inserir: jest.fn()
        }
    }
}
