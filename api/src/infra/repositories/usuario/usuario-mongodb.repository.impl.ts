import { Types } from "mongoose";

import { IUsuarioRepository } from "../../../domain/repositories/usuario.repository";
import { Usuario } from "../../../domain/entities/usuario/usuario.entity";
import { IUsuarioDocument, UsuarioModel } from "../../models/usuario/usuario.model";
import { UsuarioMapper } from "./usuario.mapper";

export class UsuarioMongodbRepositoryImpl implements IUsuarioRepository {
    public async buscarPorEmail(email : string) : Promise< Usuario | null > {
        const documento = await UsuarioModel.findOne({email: email});
        if (!documento) return null

        return UsuarioMapper.paraEntidade(documento)
    }
    public async inserir(usuario : Usuario) : Promise<Usuario> {
        const usuarioDocumento : IUsuarioDocument = UsuarioMapper.paraDocumento(usuario)
        const documentoInserido = await UsuarioModel.create(usuarioDocumento)

        return UsuarioMapper.paraEntidade(documentoInserido)
    }

    public async vincularPrestador(idCliente : string, idPrestador : string) : Promise<void> {
        await UsuarioModel.updateOne(
            { _id: idCliente },
            { $set: { id_prestador: new Types.ObjectId(idPrestador) } }
        )
    }
}