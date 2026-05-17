import { IUsuarioRepository } from "../../../domain/repositories/usuario.repository";
import { Usuario } from "../../../domain/entities/usuario/usuario.entity";
import { UsuarioModel } from "../../models/usuario/usuario.model";
import { NomeUsuarioValueObject } from "../../../domain/value-objects/usuario/nome/nome.vo";
import { EmailUsuarioValueObject } from "../../../domain/value-objects/usuario/email/email.vo";
import { SenhaUsuarioValueObject } from "../../../domain/value-objects/usuario/senha/senha.vo";
import {PerfisUsuarioValueObject} from "../../../domain/value-objects/usuario/perfis/perfis.vo";

export class UsuarioMongodbRepositoryImpl implements IUsuarioRepository {
    public async buscarPorEmail(email : string) : Promise< Usuario | null > {
        const documento = await UsuarioModel.findOne({email: email});
        if (!documento) return null

        return Usuario.criarUsuario({
            id : documento.id,
            nome : new NomeUsuarioValueObject(documento.nome),
            email : new EmailUsuarioValueObject(documento.email),
            senha : new SenhaUsuarioValueObject(documento.senha),
            perfis : new PerfisUsuarioValueObject(documento.perfis),
            data_cadastro : documento.data_cadastro,
            ativo : documento.ativo,
            reputacao_flag_cancelamento : documento.reputacao_flag_cancelamento
        })
    }
    public async inserir(usuario : Usuario) : Promise<Usuario> {
        const documentoInserido = await UsuarioModel.create({
            _id : usuario.id,
            nome : usuario.nome,
            email : usuario.email,
            senha: usuario.senha,
            perfis : usuario.perfis as Array<'cliente' | 'prestador'>,
            data_cadastro : usuario.data_cadastro,
            ativo : usuario.ativo,
            reputacao_flag_cancelamento : usuario.reputacao_flag_cancelamento
        })

        return Usuario.criarUsuario({
            id : documentoInserido._id.toString(),
            nome : new NomeUsuarioValueObject(documentoInserido.nome),
            email : new EmailUsuarioValueObject(documentoInserido.email),
            senha : new SenhaUsuarioValueObject(documentoInserido.senha),
            perfis : new PerfisUsuarioValueObject(documentoInserido.perfis),
            data_cadastro : documentoInserido.data_cadastro,
            ativo : documentoInserido.ativo,
            reputacao_flag_cancelamento : documentoInserido.reputacao_flag_cancelamento
        })
    }
}