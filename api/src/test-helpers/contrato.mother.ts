import { Types } from "mongoose";

import { Contrato } from "../domain/entities/contrato/contrato.entity";
import { ContratoFactory } from "../domain/factories/contrato.factory";
import { IContratoRepository } from "../domain/repositories/contrato.repository";
import { StatusContrato, StatusContratoTipo } from "../domain/value-objects/contrato/status/status.vo";

export class ContratоMother {
    public static criarValido(dados?: Partial<{
        id: string
        idSolicitacao: string
        idOrcamento: string
        idCliente: string
        idPrestador: string
        status: StatusContratoTipo
        dataAceite: Date
        dataInicioEstimada: Date
        prazoEstimado: Date
        dataConclusao: Date
        cienciaPagamento: boolean
        whatsappLiberado: boolean
        motivoCancelamento: string
        canceladoPor: string
    }>): Contrato {
        return ContratoFactory.criar({
            id: dados?.id ?? new Types.ObjectId().toString(),
            idSolicitacao: dados?.idSolicitacao ?? new Types.ObjectId().toString(),
            idOrcamento: dados?.idOrcamento ?? new Types.ObjectId().toString(),
            idCliente: dados?.idCliente ?? new Types.ObjectId().toString(),
            idPrestador: dados?.idPrestador ?? new Types.ObjectId().toString(),
            status: dados?.status ?? StatusContrato.AGUARDANDO_INICIO,
            dataAceite: dados?.dataAceite ?? new Date(),
            dataInicioEstimada: dados?.dataInicioEstimada,
            prazoEstimado: dados?.prazoEstimado ?? new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
            dataConclusao: dados?.dataConclusao,
            cienciaPagamento: dados?.cienciaPagamento ?? true,
            whatsappLiberado: dados?.whatsappLiberado ?? true,
            motivoCancelamento: dados?.motivoCancelamento,
            canceladoPor: dados?.canceladoPor,
        })
    }

    public static criarRepositoryMock(): jest.Mocked<IContratoRepository> {
        return {
            buscarPorId: jest.fn(),
            buscarPorIdCliente: jest.fn(),
            buscarPorIdPrestador: jest.fn(),
            inserir: jest.fn(),
            atualizar: jest.fn(),
        }
    }
}
