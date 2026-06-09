import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import { Usuario } from "../../../domain/entities/usuario/usuario.entity";
import { UsuarioModel } from "../../models/usuario/usuario.model";
import { UsuarioMongodbRepositoryImpl } from "./usuario-mongodb.repository.impl";
import { UsuarioMother } from "../../../test-helpers/usuario.mother";
import { UsuarioMapper } from "./usuario.mapper";

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
        const documentoMock = UsuarioMapper.paraDocumento(UsuarioMother.criarUsuarioValido())
        await UsuarioModel.create(documentoMock)
        const email : string = documentoMock.email
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
        const usuarioMock = UsuarioMother.criarUsuarioValido()
        // Act
        const usuarioInserido = await repository.inserir(usuarioMock)
        // Assert
        expect(usuarioInserido).not.toBeNull()
        expect(usuarioInserido).toBeInstanceOf(Usuario)
        expect(usuarioInserido.id).not.toBeNull()
        expect(usuarioInserido.id).toBeDefined()
    })

    it('deve vincular um prestador ao usuario', async () => {
        // Arrange
        const usuarioInserido = await repository.inserir(UsuarioMother.criarUsuarioValido())
        const idPrestadorMock = new mongoose.Types.ObjectId().toString()
        // Act
        await repository.vincularPrestador(usuarioInserido.id!, idPrestadorMock)
        // Assert
        const usuarioAtualizado = await repository.buscarPorEmail(usuarioInserido.email)
        expect(usuarioAtualizado?.idPrestador).toBe(idPrestadorMock)
    })
})
