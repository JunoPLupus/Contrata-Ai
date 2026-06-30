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
            telefone : doc.telefone,
            whatsapp : doc.whatsapp,
            localizacaoCidade : doc.localizacao_cidade,
            localizacaoCep : doc.localizacao_cep,
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
            telefone : usuario.telefone,
            whatsapp : usuario.whatsapp,
            id_prestador : usuario.idPrestador ? new Types.ObjectId(usuario.idPrestador) : undefined,
            localizacao_cidade : usuario.localizacaoCidade,
            localizacao_cep : usuario.localizacaoCep,
            data_cadastro : usuario.data_cadastro,
            ativo : usuario.ativo,
            reputacao_flag_cancelamento : usuario.reputacao_flag_cancelamento
        }
    }
}