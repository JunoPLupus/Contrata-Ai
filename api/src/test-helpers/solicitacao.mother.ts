import { Types } from "mongoose";

import { Solicitacao } from "../domain/entities/solicitacao/solicitacao.entity";
import { SolicitacaoFactory } from "../domain/factories/solicitacao.factory";
import { SolicitacaoCadastroDTO } from "../domain/dto/solicitacao/solicitacao-cadastro.dto";
import { ISolicitacaoRepository } from "../domain/repositories/solicitacao.repository";
import { StatusSolicitacao, StatusSolicitacaoTipo } from "../domain/value-objects/solicitacao/status/status.vo";

export class SolicitacaoMother {
    public static criarValido(dados?: Partial<{
        idCliente: string
        idCategoria: string
        idPrestadorDireto: string
        descricao: string
        status: StatusSolicitacaoTipo
        dataSolicitacao: Date
    }>): Solicitacao {
        return SolicitacaoFactory.criar({
            idCliente: dados?.idCliente ?? new Types.ObjectId().toString(),
            idCategoria: dados?.idCategoria ?? new Types.ObjectId().toString(),
            idPrestadorDireto: dados?.idPrestadorDireto,
            descricao: dados?.descricao ?? 'Preciso de eletricista residencial',
            status: dados?.status ?? StatusSolicitacao.ABERTA,
            dataSolicitacao: dados?.dataSolicitacao ?? new Date()
        })
    }

    public static criarDTO(dados?: Partial<SolicitacaoCadastroDTO & { idPrestadorDireto?: string }>): SolicitacaoCadastroDTO {
        return {
            idCliente: dados?.idCliente ?? new Types.ObjectId().toString(),
            idCategoria: dados?.idCategoria ?? new Types.ObjectId().toString(),
            idPrestadorDireto: dados?.idPrestadorDireto,
            descricao: dados?.descricao ?? 'Preciso de eletricista residencial'
        }
    }

    public static criarRepositoryMock(): jest.Mocked<ISolicitacaoRepository> {
        return {
            buscarPorId: jest.fn(),
            buscarPorIdCliente: jest.fn(),
            buscarDisponiveisParaPrestador: jest.fn(),
            inserir: jest.fn(),
            atualizar: jest.fn()
        }
    }
}
