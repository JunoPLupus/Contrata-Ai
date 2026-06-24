import { Types } from "mongoose";

import { Orcamento } from "../domain/entities/orcamento/orcamento.entity";
import { OrcamentoFactory } from "../domain/factories/orcamento.factory";
import { OrcamentoCadastroDTO } from "../domain/dto/orcamento/orcamento-cadastro.dto";
import { IOrcamentoRepository } from "../domain/repositories/orcamento.repository";
import { StatusOrcamento, StatusOrcamentoTipo } from "../domain/value-objects/orcamento/status/status.vo";

export class OrcamentoMother {
    public static criarValido(dados?: Partial<{
        id: string
        idSolicitacao: string
        idPrestador: string
        valor: number
        prazoDias: number
        status: StatusOrcamentoTipo
        dataCriacao: Date
        dataAceite: Date
    }>): Orcamento {
        return OrcamentoFactory.criar({
            id: dados?.id ?? new Types.ObjectId().toString(),
            idSolicitacao: dados?.idSolicitacao ?? new Types.ObjectId().toString(),
            idPrestador: dados?.idPrestador ?? new Types.ObjectId().toString(),
            valor: dados?.valor ?? 250,
            prazoDias: dados?.prazoDias,
            status: dados?.status ?? StatusOrcamento.PENDENTE,
            dataCriacao: dados?.dataCriacao ?? new Date(),
            dataAceite: dados?.dataAceite
        })
    }

    public static criarDTO(dados?: Partial<OrcamentoCadastroDTO & { idCategoria?: string }>): OrcamentoCadastroDTO {
        return {
            idSolicitacao: dados?.idSolicitacao ?? new Types.ObjectId().toString(),
            idPrestador: dados?.idPrestador ?? new Types.ObjectId().toString(),
            valor: dados?.valor ?? 250,
            prazoDias: dados?.prazoDias
        }
    }

    public static criarRepositoryMock(): jest.Mocked<IOrcamentoRepository> {
        return {
            buscarPorId: jest.fn(),
            buscarPorIdPrestador: jest.fn(),
            buscarPorIdSolicitacao: jest.fn(),
            inserir: jest.fn(),
            atualizar: jest.fn()
        }
    }
}
