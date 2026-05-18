import { HydratedDocument } from "mongoose";

import { IUsuarioDocument } from "../../models/usuario/usuario.model";
import { Usuario } from "../../../domain/entities/usuario/usuario.entity";
import { UsuarioFactory } from "../../../domain/factories/usuario.factory";

export class UsuarioMapper {
    public static paraEntidade(doc: HydratedDocument<IUsuarioDocument>) : Usuario {
        return UsuarioFactory.criar({
            id : doc.id,
            nome : doc.nome,
            email : doc.email,
            senha : doc.senha,
            perfis : doc.perfis,
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
            perfis : usuario.perfis as Array<'cliente' | 'prestador'>,
            data_cadastro : usuario.data_cadastro,
            ativo : usuario.ativo,
            reputacao_flag_cancelamento : usuario.reputacao_flag_cancelamento
        }
    }
}