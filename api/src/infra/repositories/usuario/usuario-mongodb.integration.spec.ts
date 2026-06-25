import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import { Usuario } from "../../../domain/entities/usuario/usuario.entity";
import { UsuarioModel } from "../../models/usuario/usuario.model";
import { UsuarioMongodbRepositoryImpl } from "./usuario-mongodb.repository.impl";
import { UsuarioMother } from "../../../test-helpers/usuario.mother";
import { UsuarioMapper } from "./usuario.mapper";

describe('Testes de Integração do Repository: Usuário MongoDB', () => {

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

    describe('buscarPorEmail()', () => {
        it('deve buscar usuario por e-mail e retornar usuario', async () => {
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

        it('deve retornar null quando e-mail nao for encontrado', async () => {
            // Arrange
            const emailInexistente = "email.inexistente@gmail.com"
            // Act
            const usuario = await repository.buscarPorEmail(emailInexistente)
            // Assert
            expect(usuario).toBeNull()
        })
    })

    describe('buscarPorId()', () => {
        it('deve buscar usuario por id e retornar usuario', async () => {
            // Arrange
            const usuarioInserido = await repository.inserir(UsuarioMother.criarUsuarioValido())
            // Act
            const usuario = await repository.buscarPorId(usuarioInserido.id!)
            // Assert
            expect(usuario).not.toBeNull()
            expect(usuario).toBeInstanceOf(Usuario)
            expect(usuario?.id).toBe(usuarioInserido.id)
        })

        it('deve retornar null quando id nao for encontrado', async () => {
            // Arrange
            const idInexistente = new mongoose.Types.ObjectId().toString()
            // Act
            const usuario = await repository.buscarPorId(idInexistente)
            // Assert
            expect(usuario).toBeNull()
        })

        it('deve retornar null quando id tiver formato invalido', async () => {
            // Arrange
            const idInvalido = "id-invalido"
            // Act
            const usuario = await repository.buscarPorId(idInvalido)
            // Assert
            expect(usuario).toBeNull()
        })
    })

    describe('inserir()', () => {
        it('deve inserir um usuario e retorna-lo com id', async () => {
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
    })

    describe('atualizar()', () => {
        it('deve atualizar os dados do usuario e retorna-lo atualizado', async () => {
            // Arrange
            const usuarioInserido = await repository.inserir(UsuarioMother.criarUsuarioValido())
            usuarioInserido.nome = 'Nome Atualizado'
            // Act
            const atualizado = await repository.atualizar(usuarioInserido)
            // Assert
            expect(atualizado).toBeInstanceOf(Usuario)
            expect(atualizado.id).toBe(usuarioInserido.id)
            expect(atualizado.nome).toBe('Nome Atualizado')
        })

        it('deve lancar erro ao tentar atualizar usuario com id inexistente', async () => {
            // Arrange
            const usuarioInexistente = UsuarioMother.criarUsuarioValido({ id: new mongoose.Types.ObjectId().toString() })
            // Act & Assert
            await expect(repository.atualizar(usuarioInexistente)).rejects.toThrow()
        })
    })

    describe('vincularPrestador()', () => {
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

    describe('incrementarFlagCancelamento()', () => {
        it('deve incrementar a flag de cancelamento do usuario', async () => {
            // Arrange
            const usuarioInserido = await repository.inserir(UsuarioMother.criarUsuarioValido({ reputacao_flag_cancelamento: 0 }))
            // Act
            await repository.incrementarFlagCancelamento(usuarioInserido.id!)
            await repository.incrementarFlagCancelamento(usuarioInserido.id!)
            // Assert
            const usuarioAtualizado = await repository.buscarPorId(usuarioInserido.id!)
            expect(usuarioAtualizado?.reputacao_flag_cancelamento).toBe(2)
        })

        it('nao deve lancar erro ao incrementar flag de usuario com id inexistente', async () => {
            // Arrange
            const idInexistente = new mongoose.Types.ObjectId().toString()
            // Act & Assert
            await expect(repository.incrementarFlagCancelamento(idInexistente)).resolves.not.toThrow()
        })
    })
})
