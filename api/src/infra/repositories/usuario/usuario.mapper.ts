import { HydratedDocument, Types } from "mongoose";

import { IUsuarioDocument } from "../../models/usuario/usuario.model";
import { Usuario } from "../../../domain/entities/usuario/usuario.entity";
import { UsuarioFactory } from "../../../domain/factories/usuario.factory";

export class UsuarioMapper {
    public static paraEntidade(doc: HydratedDocument<IUsuarioDocument>) : Usuario {
        return UsuarioFactory.criar({
            id : doc.id,
            idPrestador : doc.id_prestador?.toString(),
            nome : doc.nome,
            email : doc.email,
            senha : doc.senha,
            ativo : doc.ativo,
            data_cadastro : doc.data_cadastro,
            reputacao_flag_cancelamento : doc.reputacao_flag_cancelamento
        })
    }

    public static paraDocumento(usuario: Usuario) : IUsuarioDocument {
        return {
            nome : usuario.nome,
            email : usuario.email,
            senha: usuario.senha,
            id_prestador : usuario.idPrestador ? new Types.ObjectId(usuario.idPrestador) : undefined,
            data_cadastro : usuario.data_cadastro,
            ativo : usuario.ativo,
            reputacao_flag_cancelamento : usuario.reputacao_flag_cancelamento
        }
    }
}