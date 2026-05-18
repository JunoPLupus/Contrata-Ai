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
}