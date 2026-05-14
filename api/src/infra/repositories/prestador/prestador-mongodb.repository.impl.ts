import { IPrestadorRepository } from "../../../domain/repositories/prestador.repository";
import { Prestador } from "../../../domain/entities/prestador/prestador.entity";
import { PrestadorModel } from "../../models/prestador/prestador.model";

import { Types } from "mongoose";

export class PrestadorMongodbRepositoryImpl implements IPrestadorRepository {
    public async inserir(prestador: Prestador): Promise<Prestador> {
        const documentoInserido = await PrestadorModel.create({
            id_cliente : new Types.ObjectId(prestador.idCliente)
        })
        return Prestador.criarPrestador({
            id : documentoInserido._id.toString(),
            idCliente : documentoInserido.id_cliente.toString()
        })
    }
}