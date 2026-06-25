import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import { PrestadorMongodbRepositoryImpl } from "./prestador-mongodb.repository.impl";
import { Prestador } from "../../../domain/entities/prestador/prestador.entity";
import { PrestadorMother } from "../../../test-helpers/prestador.mother";

describe('Testes de Integração do Repository: Prestador MongoDB', () => {

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

    describe('inserir()', () => {
        it('deve inserir um prestador e retoná-lo com id', async() => {
            // Arrange
            const prestadorMock = PrestadorMother.criarValido()
            // Act
            const prestadorInserido = await repository.inserir(prestadorMock)
            // Assert
            expect(prestadorInserido).not.toBeNull()
            expect(prestadorInserido).toBeInstanceOf(Prestador)
            expect(prestadorInserido.id).not.toBeNull()
            expect(prestadorInserido.id).toBeDefined()
        })
    })

    describe('buscarPorId()', () => {
        it('deve buscar um prestador pelo id', async () => {
            // Arrange
            const prestadorMock = PrestadorMother.criarValido({ telefone: '11999999999', descricao: 'Descrição válida do prestador' })
            const prestadorInserido = await repository.inserir(prestadorMock)
            // Act
            const prestadorEncontrado = await repository.buscarPorId(prestadorInserido.id!)
            // Assert
            expect(prestadorEncontrado).not.toBeNull()
            expect(prestadorEncontrado!.id).toBe(prestadorInserido.id)
            expect(prestadorEncontrado!.telefone).toBe('11999999999')
            expect(prestadorEncontrado!.descricao).toBe('Descrição válida do prestador')
            expect(prestadorEncontrado!.ativo).toBe(true)
        })

        it('deve retornar null ao buscar um id inexistente', async () => {
            // Act
            const prestadorEncontrado = await repository.buscarPorId('507f1f77bcf86cd799439011')
            // Assert
            expect(prestadorEncontrado).toBeNull()
        })
    })

    describe('atualizar()', () => {
        it('deve atualizar os dados de um prestador existente', async () => {
            // Arrange
            const prestadorMock = PrestadorMother.criarValido()
            const prestadorInserido = await repository.inserir(prestadorMock)
            prestadorInserido.telefone = '11999999999'
            prestadorInserido.descricao = 'Nova descrição do prestador'
            // Act
            const prestadorAtualizado = await repository.atualizar(prestadorInserido)
            // Assert
            expect(prestadorAtualizado.telefone).toBe('11999999999')
            expect(prestadorAtualizado.descricao).toBe('Nova descrição do prestador')
        })
    })

    describe('inativar()', () => {
        it('deve inativar um prestador existente', async () => {
            // Arrange
            const prestadorMock = PrestadorMother.criarValido()
            const prestadorInserido = await repository.inserir(prestadorMock)
            // Act
            await repository.inativar(prestadorInserido.id!)
            // Assert
            const prestadorEncontrado = await repository.buscarPorId(prestadorInserido.id!)
            expect(prestadorEncontrado!.ativo).toBe(false)
        })
    })

    describe('ativar()', () => {
        it('deve ativar um prestador existente', async () => {
            // Arrange
            const prestadorMock = PrestadorMother.criarValido({ ativo: false })
            const prestadorInserido = await repository.inserir(prestadorMock)
            // Act
            await repository.ativar(prestadorInserido.id!)
            // Assert
            const prestadorEncontrado = await repository.buscarPorId(prestadorInserido.id!)
            expect(prestadorEncontrado!.ativo).toBe(true)
        })
    })
})