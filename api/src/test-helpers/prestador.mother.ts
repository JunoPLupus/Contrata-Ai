import { Types } from "mongoose";

import { Prestador } from "../domain/entities/prestador/prestador.entity";
import { PrestadorFactory } from "../domain/factories/prestador.factory";
import { PrestadorCadastroDTO } from "../domain/dto/prestador/prestador-cadastro.dto";
import { IPrestadorRepository } from "../domain/repositories/prestador.repository";

type PrestadorValidoDTO = PrestadorCadastroDTO & {
    id : string
    telefone : string
    descricao : string
    ativo : boolean
}

export class PrestadorMother {
    public static criarValido(dto ?: Partial<PrestadorValidoDTO>) : Prestador {
        return PrestadorFactory.criar({
            id : dto?.id ?? (new Types.ObjectId).toString(),
            idCliente : dto?.idCliente ?? (new Types.ObjectId).toString(),
            telefone : dto?.telefone,
            descricao : dto?.descricao,
            ativo : dto?.ativo ?? true
        })
    }
    public static criarDTO(dto ?: PrestadorCadastroDTO) : PrestadorCadastroDTO {
        return {
            idCliente : dto?.idCliente ?? (new Types.ObjectId).toString()
        }
    }
    public static criarRepositoryMock(): jest.Mocked<IPrestadorRepository> {
        return {
            inserir: jest.fn(),
            buscarPorId: jest.fn(),
            atualizar: jest.fn(),
            inativar: jest.fn(),
            ativar: jest.fn()
        }
    }
}
