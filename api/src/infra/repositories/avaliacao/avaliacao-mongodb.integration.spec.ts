import mongoose, { Types } from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import { Avaliacao } from "../../../domain/entities/avaliacao/avaliacao.entity";
import { AvaliacaoModel } from "../../models/avaliacao/avaliacao.model";
import { AvaliacaoMongodbRepositoryImpl } from "./avaliacao-mongodb.repository.impl";
import { AvaliacaoMapper } from "./avaliacao.mapper";
import { AvaliacaoMother } from "../../../test-helpers/avaliacao.mother";

describe('Testes de Integração do Repository: Avaliação MongoDB', () => {
    let repository: AvaliacaoMongodbRepositoryImpl
    let mongod: MongoMemoryServer
    let avaliacaoMock: Avaliacao

    beforeAll(async () => {
        mongod = await MongoMemoryServer.create()
        await mongoose.connect(mongod.getUri())
    })

    afterAll(async () => {
        await mongoose.disconnect()
        await mongod.stop()
    })

    beforeEach(() => {
        repository = new AvaliacaoMongodbRepositoryImpl()
        avaliacaoMock = AvaliacaoMother.criarValido()
    })

    afterEach(async () => {
        const collections = mongoose.connection.collections
        for (const key in collections) {
            await collections[key].deleteMany({})
        }
    })

    describe('buscarPorId()', () => {
        it('deve buscar avaliação por ID e retornar entidade', async () => {
            // Arrange
            const documentoInserido = await AvaliacaoModel.create(AvaliacaoMapper.paraDocumento(avaliacaoMock))
            // Act
            const encontrada = await repository.buscarPorId(documentoInserido.id.toString())
            // Assert
            expect(encontrada).toBeInstanceOf(Avaliacao)
            expect(encontrada?.idCliente).toBe(avaliacaoMock.idCliente)
        })

        it('deve retornar null quando ID não for encontrado', async () => {
            // Arrange
            const idInexistente = new Types.ObjectId().toString()
            // Act
            const resultado = await repository.buscarPorId(idInexistente)
            // Assert
            expect(resultado).toBeNull()
        })
    })

    describe('buscarPorIdContrato()', () => {
        it('deve retornar a avaliação do contrato', async () => {
            // Arrange
            await AvaliacaoModel.create(AvaliacaoMapper.paraDocumento(avaliacaoMock))
            // Act
            const resultado = await repository.buscarPorIdContrato(avaliacaoMock.idContrato)
            // Assert
            expect(resultado).toBeInstanceOf(Avaliacao)
            expect(resultado?.idContrato).toBe(avaliacaoMock.idContrato)
        })

        it('deve retornar null quando o contrato não tiver avaliação', async () => {
            // Act
            const resultado = await repository.buscarPorIdContrato(new Types.ObjectId().toString())
            // Assert
            expect(resultado).toBeNull()
        })
    })

    describe('buscarPorIdCliente()', () => {
        it('deve buscar avaliações por idCliente e retornar lista', async () => {
            // Arrange
            const idCliente = new Types.ObjectId().toString()
            const a1 = AvaliacaoMother.criarValido({ idCliente })
            const a2 = AvaliacaoMother.criarValido({ idCliente })
            await AvaliacaoModel.create(AvaliacaoMapper.paraDocumento(a1))
            await AvaliacaoModel.create(AvaliacaoMapper.paraDocumento(a2))
            // Act
            const resultado = await repository.buscarPorIdCliente(idCliente)
            // Assert
            expect(resultado).toHaveLength(2)
            expect(resultado.every(a => a.idCliente === idCliente)).toBe(true)
        })

        it('deve retornar array vazio quando cliente não tiver avaliações', async () => {
            // Act
            const resultado = await repository.buscarPorIdCliente(new Types.ObjectId().toString())
            // Assert
            expect(resultado).toHaveLength(0)
        })
    })

    describe('buscarPorIdPrestador()', () => {
        it('deve buscar avaliações por idPrestador e retornar lista', async () => {
            // Arrange
            const idPrestador = new Types.ObjectId().toString()
            const a1 = AvaliacaoMother.criarValido({ idPrestador })
            const a2 = AvaliacaoMother.criarValido({ idPrestador })
            await AvaliacaoModel.create(AvaliacaoMapper.paraDocumento(a1))
            await AvaliacaoModel.create(AvaliacaoMapper.paraDocumento(a2))
            // Act
            const resultado = await repository.buscarPorIdPrestador(idPrestador)
            // Assert
            expect(resultado).toHaveLength(2)
            expect(resultado.every(a => a.idPrestador === idPrestador)).toBe(true)
        })

        it('deve retornar array vazio quando prestador não tiver avaliações', async () => {
            // Act
            const resultado = await repository.buscarPorIdPrestador(new Types.ObjectId().toString())
            // Assert
            expect(resultado).toHaveLength(0)
        })
    })

    describe('inserir()', () => {
        it('deve inserir uma avaliação e retorná-la com id', async () => {
            // Act
            const inserida = await repository.inserir(avaliacaoMock)
            // Assert
            expect(inserida).toBeInstanceOf(Avaliacao)
            expect(inserida.id).toBeDefined()
            expect(inserida.nota).toBe(avaliacaoMock.nota)
            expect(inserida.idCliente).toBe(avaliacaoMock.idCliente)
        })

        it('deve garantir unicidade de id_contrato (índice único)', async () => {
            // Arrange
            const idContrato = new Types.ObjectId().toString()
            const primeiraAvaliacao = AvaliacaoMother.criarValido({ idContrato })
            const segundaAvaliacao = AvaliacaoMother.criarValido({ idContrato })
            await repository.inserir(primeiraAvaliacao)

            // Act & Assert
            await expect(repository.inserir(segundaAvaliacao)).rejects.toThrow()
        })
    })

    describe('atualizar()', () => {
        it('deve atualizar a nota da avaliação e retorná-la atualizada', async () => {
            // Arrange
            const documentoInserido = await AvaliacaoModel.create(AvaliacaoMapper.paraDocumento(avaliacaoMock))
            const avaliacaoInserida = AvaliacaoMapper.paraEntidade(documentoInserido)
            avaliacaoInserida.atualizar({ nota: 2 })
            // Act
            const atualizada = await repository.atualizar(avaliacaoInserida)
            // Assert
            expect(atualizada).toBeInstanceOf(Avaliacao)
            expect(atualizada.nota).toBe(2)
        })
    })

    describe('deletar()', () => {
        it('deve remover a avaliação permanentemente', async () => {
            // Arrange
            const documentoInserido = await AvaliacaoModel.create(AvaliacaoMapper.paraDocumento(avaliacaoMock))
            const id = documentoInserido.id.toString()
            // Act
            await repository.deletar(id)
            // Assert
            const encontrada = await repository.buscarPorId(id)
            expect(encontrada).toBeNull()
        })
    })
})
