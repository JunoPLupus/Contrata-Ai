import { Types } from "mongoose";

import { Servico } from "../domain/entities/servico/servico.entity";
import { ServicoFactory } from "../domain/factories/servico.factory";

export class ServicoMother {
    public static criarValido(dados?: Partial<{
        idPrestador: string,
        idCategoria: string,
        descricao: string,
        precoMin: number,
        precoMax: number,
        prazoMedioDias: number,
        ativo: boolean
    }>): Servico {
        return ServicoFactory.criar({
            idPrestador: dados?.idPrestador ?? new Types.ObjectId().toString(),
            idCategoria: dados?.idCategoria ?? new Types.ObjectId().toString(),
            descricao: dados?.descricao ?? 'Instalacao eletrica residencial',
            precoMin: dados?.precoMin,
            precoMax: dados?.precoMax,
            prazoMedioDias: dados?.prazoMedioDias,
            ativo: dados?.ativo ?? true
        })
    }
}
