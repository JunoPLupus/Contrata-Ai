import { PrestadorMongodbRepositoryImpl } from "./prestador-mongodb.repository.impl";
import { Prestador } from "../../../domain/entities/prestador/prestador.entity";

import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose, { Types } from "mongoose";

describe('Prestador MongoDB Repository', () => {

    let repository : PrestadorMongodbRepositoryImpl
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
        repository = new PrestadorMongodbRepositoryImpl()
    })
    afterEach(async () => {
        const collections = mongoose.connection.collections
        for (const key in collections) {
            await collections[key].deleteMany({})
        }
    })

    it('deve inserir um prestador e retoná-lo com id', async() => {
        // Arrange
        const prestadorMock = Prestador.criarPrestador({
            idCliente : new Types.ObjectId().toString()
        })
        // Act
        const prestadorInserido = await repository.inserir(prestadorMock)
        // Assert
        expect(prestadorInserido).not.toBeNull()
        expect(prestadorInserido).toBeInstanceOf(Prestador)
        expect(prestadorInserido.id).not.toBeNull()
        expect(prestadorInserido.id).toBeDefined()
    })
})