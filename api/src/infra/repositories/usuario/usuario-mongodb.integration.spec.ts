import { Usuario } from "../../../domain/entities/usuario/usuario.entity";
import { UsuarioModel } from "../../models/usuario/usuario.model";
import { NomeUsuarioValueObject } from "../../../domain/value-objects/usuario/nome/nome.vo";
import { SenhaUsuarioValueObject } from "../../../domain/value-objects/usuario/senha/senha.vo";
import { EmailUsuarioValueObject } from "../../../domain/value-objects/usuario/email/email.vo";
import { UsuarioMongodbRepositoryImpl } from "./usuario-mongodb.repository.impl";

import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import {PerfisUsuarioValueObject} from "../../../domain/value-objects/usuario/perfis/perfis.vo";

describe('Usuario Mongodb Repository', () => {

    let repository: UsuarioMongodbRepositoryImpl
    let mongod : MongoMemoryServer

    beforeAll(async () => {
        mongod = await MongoMemoryServer.create()
        await mongoose.connect(mongod.getUri())
    })
    afterAll(async () => {
        await mongoose.disconnect()
        await mongod.stop()
    })
    beforeEach(async () => {
        repository = new UsuarioMongodbRepositoryImpl()
    })
    afterEach(async () => {
        const collections = mongoose.connection.collections
        for (const key in collections) {
            await collections[key].deleteMany({})
        }
    })

    it('deve buscar usuário por e-mail e retornar usuário', async () => {
        // Arrange
        const email : string = "teste@gmail.com"
        await UsuarioModel.create({
            nome: 'Fulano',
            email: 'teste@gmail.com',
            senha: 'senha123',
            perfis: ['cliente'],
            data_cadastro: new Date(),
            ativo: true,
            reputacao_flag_cancelamento: 0
        })
        // Act
        const usuario = await repository.buscarPorEmail(email)
        // Assert
        expect(usuario).not.toBeNull()
        expect(usuario).toBeInstanceOf(Usuario)
        expect(usuario?.email).toBe(email)
    })

    it('deve retornar null quando e-mail não for encontrado', async () => {
        // Arrange
        const emailInexistente = "email.inexistente@gmail.com"
        // Act
        const usuario = await repository.buscarPorEmail(emailInexistente)
        // Assert
        expect(usuario).toBeNull()
    })

    it('deve inserir um usuário e retorná-lo com id', async () => {
        // Arrange
        const propsUsuario = {
            nome: new NomeUsuarioValueObject("Fulano Silva"),
            senha: new SenhaUsuarioValueObject("senha123"),
            email: new EmailUsuarioValueObject("fulano.silva@gmail.com"),
            perfis: new PerfisUsuarioValueObject(['cliente', 'prestador']),
            data_cadastro: new Date(),
            ativo: true,
            reputacao_flag_cancelamento: 0
        }
        const usuarioMock = Usuario.criarUsuario(propsUsuario)
        // Act
        const usuarioInserido = await repository.inserir(usuarioMock)
        // Assert
        expect(usuarioInserido).not.toBeNull()
        expect(usuarioInserido).toBeInstanceOf(Usuario)
        expect(usuarioInserido.id).not.toBeNull()
        expect(usuarioInserido.id).toBeDefined()
    })
})