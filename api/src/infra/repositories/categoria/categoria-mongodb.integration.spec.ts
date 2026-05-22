import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import { Categoria } from "../../../domain/entities/categoria/categoria.entity";
import { CategoriaModel } from "../../models/categoria/categoria.model";
import { CategoriaMongodbRepositoryImpl } from "./categoria-mongodb.repository.impl";
import { CategoriaMother } from "../../../test-helpers/categoria.mother";
import { CategoriaMapper } from "./categoria.mapper";

describe('Categoria MongoDB Repository', () => {

    let repository: CategoriaMongodbRepositoryImpl
    let mongod: MongoMemoryServer

    beforeAll(async () => {
        mongod = await MongoMemoryServer.create()
        await mongoose.connect(mongod.getUri())
    })
    afterAll(async () => {
        await mongoose.disconnect()
        await mongod.stop()
    })
    beforeEach(async () => {
        repository = new CategoriaMongodbRepositoryImpl()
    })
    afterEach(async () => {
        const collections = mongoose.connection.collections
        for (const key in collections) {
            await collections[key].deleteMany({})
        }
    })

    it('deve buscar categoria por ID e retornar categoria', async () => {
        // Arrange
        const categoriaMock = CategoriaMother.criarValido()
        const documentoInserido = await CategoriaModel.create(CategoriaMapper.paraDocumento(categoriaMock))
        // Act
        const categoria = await repository.buscarPorId(documentoInserido.id.toString())
        // Assert
        expect(categoria).not.toBeNull()
        expect(categoria).toBeInstanceOf(Categoria)
        expect(categoria?.nome).toBe(categoriaMock.nome)
    })

    it('deve retornar null quando ID nao for encontrado', async () => {
        // Arrange
        const idInexistente = new mongoose.Types.ObjectId().toString()
        // Act
        const categoria = await repository.buscarPorId(idInexistente)
        // Assert
        expect(categoria).toBeNull()
    })

    it('deve buscar categoria por nome e retornar categoria', async () => {
        // Arrange
        const categoriaMock = CategoriaMother.criarValido({ nome: 'Hidraulica' })
        await CategoriaModel.create(CategoriaMapper.paraDocumento(categoriaMock))
        // Act
        const categoria = await repository.buscarPorNome('Hidraulica')
        // Assert
        expect(categoria).not.toBeNull()
        expect(categoria).toBeInstanceOf(Categoria)
        expect(categoria?.nome).toBe('Hidraulica')
    })

    it('deve retornar null quando nome nao for encontrado', async () => {
        // Act
        const categoria = await repository.buscarPorNome('NomeInexistente')
        // Assert
        expect(categoria).toBeNull()
    })
})
