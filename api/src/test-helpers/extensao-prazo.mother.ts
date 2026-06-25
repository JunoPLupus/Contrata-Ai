import { Types } from "mongoose";

import { ExtensaoPrazo } from "../domain/entities/extensao-prazo/extensao-prazo.entity";
import { ExtensaoPrazoFactory } from "../domain/factories/extensao-prazo.factory";
import { IExtensaoPrazoRepository } from "../domain/repositories/extensao-prazo.repository";
import { StatusExtensaoPrazo, StatusExtensaoPrazoTipo } from "../domain/value-objects/extensao-prazo/status/status.vo";

export class ExtensaoPrazoMother {
    public static criarValido(dados?: Partial<{
        id: string
        idContrato: string
        novoPrazo: Date
        justificativa: string
        status: StatusExtensaoPrazoTipo
        dataSolicitacao: Date
        dataResposta: Date
    }>): ExtensaoPrazo {
        return ExtensaoPrazoFactory.criar({
            id: dados?.id ?? new Types.ObjectId().toString(),
            idContrato: dados?.idContrato ?? new Types.ObjectId().toString(),
            novoPrazo: dados?.novoPrazo ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            justificativa: dados?.justificativa ?? 'Justificativa de extensão de prazo válida.',
            status: dados?.status ?? StatusExtensaoPrazo.PENDENTE,
            dataSolicitacao: dados?.dataSolicitacao ?? new Date(),
            dataResposta: dados?.dataResposta,
        })
    }

    public static criarRepositoryMock(): jest.Mocked<IExtensaoPrazoRepository> {
        return {
            buscarPorId: jest.fn(),
            inserir: jest.fn(),
            atualizar: jest.fn(),
        }
    }
}
