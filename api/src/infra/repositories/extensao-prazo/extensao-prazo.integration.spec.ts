import mongoose, { Types } from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import { ExtensaoPrazo } from "../../../domain/entities/extensao-prazo/extensao-prazo.entity";
import { ExtensaoPrazoModel } from "../../models/extensao-prazo/extensao-prazo.model";
import { ExtensaoPrazoMongodbRepositoryImpl } from "./extensao-prazo-mongodb.repository.impl";
import { ExtensaoPrazoMapper } from "./extensao-prazo.mapper";
import { ExtensaoPrazoMother } from "../../../test-helpers/extensao-prazo.mother";
import { StatusExtensaoPrazo } from "../../../domain/value-objects/extensao-prazo/status/status.vo";

describe('Testes de Integração do Repository: Extensão-Prazo MongoDB', () => {
    let repository: ExtensaoPrazoMongodbRepositoryImpl
    let mongod: MongoMemoryServer
    let extensaoMock: ExtensaoPrazo

    beforeAll(async () => {
        mongod = await MongoMemoryServer.create()
        await mongoose.connect(mongod.getUri())
    })

    afterAll(async () => {
        await mongoose.disconnect()
        await mongod.stop()
    })

    beforeEach(() => {
        repository = new ExtensaoPrazoMongodbRepositoryImpl()
        extensaoMock = ExtensaoPrazoMother.criarValido()
    })

    afterEach(async () => {
        const collections = mongoose.connection.collections
        for (const key in collections) {
            await collections[key].deleteMany({})
        }
    })

    describe('buscarPorId()', () => {
        it('deve buscar extensao de prazo por ID e retornar entidade', async () => {
            // Arrange
            const documentoInserido = await ExtensaoPrazoModel.create(ExtensaoPrazoMapper.paraDocumento(extensaoMock))
            // Act
            const encontrado = await repository.buscarPorId(documentoInserido.id.toString())
            // Assert
            expect(encontrado).toBeInstanceOf(ExtensaoPrazo)
            expect(encontrado?.idContrato).toBe(extensaoMock.idContrato)
        })

        it('deve retornar null quando ID nao for encontrado', async () => {
            // Arrange
            const idInexistente = new Types.ObjectId().toString()
            // Act
            const resultado = await repository.buscarPorId(idInexistente)
            // Assert
            expect(resultado).toBeNull()
        })
    })

    describe('inserir()', () => {
        it('deve inserir uma extensao de prazo e retorna-la com id', async () => {
            // Arrange & Act
            const inserida = await repository.inserir(extensaoMock)
            // Assert
            expect(inserida).toBeInstanceOf(ExtensaoPrazo)
            expect(inserida.id).toBeDefined()
            expect(inserida.status).toBe(StatusExtensaoPrazo.PENDENTE)
            expect(inserida.idContrato).toBe(extensaoMock.idContrato)
        })
    })

    describe('atualizar()', () => {
        it('deve atualizar status da extensao de prazo e retorna-la atualizada', async () => {
            // Arrange
            const documentoInserido = await ExtensaoPrazoModel.create(ExtensaoPrazoMapper.paraDocumento(extensaoMock))
            const extensaoInserida = ExtensaoPrazoMapper.paraEntidade(documentoInserido)
            extensaoInserida.status = StatusExtensaoPrazo.APROVADA
            // Act
            const atualizada = await repository.atualizar(extensaoInserida)
            // Assert
            expect(atualizada).toBeInstanceOf(ExtensaoPrazo)
            expect(atualizada.status).toBe(StatusExtensaoPrazo.APROVADA)
        })
    })
})
