import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import { Categoria } from "../../../domain/entities/categoria/categoria.entity";
import { CategoriaModel } from "../../models/categoria/categoria.model";
import { CategoriaMongodbRepositoryImpl } from "./categoria-mongodb.repository.impl";
import { CategoriaMother } from "../../../test-helpers/categoria.mother";
import { CategoriaMapper } from "./categoria.mapper";

describe('Testes de Integração do Repository: Categoria MongoDB', () => {

    let repository: CategoriaMongodbRepositoryImpl
    let mongod: MongoMemoryServer
    let categoriaMock : Categoria

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

        categoriaMock = CategoriaMother.criarValido()
    })
    afterEach(async () => {
        const collections = mongoose.connection.collections
        for (const key in collections) {
            await collections[key].deleteMany({})
        }
    })

    describe('buscarPorId', () => {
        it('deve buscar categoria por ID e retornar categoria', async () => {
            // Arrange
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
    })
    describe('buscarTodas', () => {
        it('deve retornar todas as categorias persistidas', async () => {
            // Arrange
            const categoriasMock = CategoriaMother.criarLista(3)
            for (const cat of categoriasMock) {
                await CategoriaModel.create(CategoriaMapper.paraDocumento(cat))
            }
            // Act
            const categorias = await repository.buscarTodas()
            // Assert
            expect(categorias).toHaveLength(3)
            expect(categorias[0]).toBeInstanceOf(Categoria)
        })

        it('deve retornar lista vazia quando nao houver categorias', async () => {
            // Act
            const categorias = await repository.buscarTodas()
            // Assert
            expect(categorias).toEqual([])
        })
    })

    describe('buscarPorCategoriaPaiId', () => {

        let docPai : any

        beforeEach(async () => {
            docPai = await CategoriaModel.create(CategoriaMapper.paraDocumento(categoriaMock))
        })
        it('deve retornar as categorias filhas de uma categoria pai existente', async () => {
            // Arrange
            const idPai = docPai.id.toString()
            const filhasMock = CategoriaMother.criarLista(2, { categoriaPaiId: idPai })
            for (const cat of filhasMock) {
                await CategoriaModel.create(CategoriaMapper.paraDocumento(cat))
            }
            // Act
            const resultado = await repository.buscarPorCategoriaPaiId(idPai)
            // Assert
            expect(resultado).toHaveLength(2)
            expect(resultado[0]).toBeInstanceOf(Categoria)
            expect(resultado.every(c => c.categoriaPaiId === idPai)).toBe(true)
        })

        it('deve retornar lista vazia quando categoria pai nao existir', async () => {
            // Arrange
            const idInexistente = new mongoose.Types.ObjectId().toString()
            // Act
            const resultado = await repository.buscarPorCategoriaPaiId(idInexistente)
            // Assert
            expect(resultado).toEqual([])
        })

        it('deve retornar lista vazia quando categoria pai existir mas nao tiver filhas', async () => {
            // Arrange & Act
            const resultado = await repository.buscarPorCategoriaPaiId(docPai.id)
            // Assert
            expect(resultado).toEqual([])
        })
    })
})
