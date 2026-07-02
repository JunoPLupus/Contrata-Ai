import mongoose, { Types } from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import { Contrato } from "../../../domain/entities/contrato/contrato.entity";
import { ContratoModel } from "../../models/contrato/contrato.model";
import { ContratoMongodbRepositoryImpl } from "./contrato-mongodb.repository.impl";
import { ContratoMapper } from "./contrato.mapper";
import { ContratоMother } from "../../../test-helpers/contrato.mother";
import { StatusContrato } from "../../../domain/value-objects/contrato/status/status.vo";

describe('Testes de Integracao do Repository: Contrato MongoDB', () => {
    let repository: ContratoMongodbRepositoryImpl
    let mongod: MongoMemoryServer
    let contratoMock: Contrato

    beforeAll(async () => {
        mongod = await MongoMemoryServer.create()
        await mongoose.connect(mongod.getUri())
    })

    afterAll(async () => {
        await mongoose.disconnect()
        await mongod.stop()
    })

    beforeEach(() => {
        repository = new ContratoMongodbRepositoryImpl()
        contratoMock = ContratоMother.criarValido()
    })

    afterEach(async () => {
        const collections = mongoose.connection.collections
        for (const key in collections) {
            await collections[key].deleteMany({})
        }
    })

    describe('buscarPorId()', () => {
        it('deve buscar contrato por ID e retornar entidade', async () => {
            // Arrange
            const documentoInserido = await ContratoModel.create(ContratoMapper.paraDocumento(contratoMock))
            // Act
            const encontrado = await repository.buscarPorId(documentoInserido.id.toString())
            // Assert
            expect(encontrado).toBeInstanceOf(Contrato)
            expect(encontrado?.idCliente).toBe(contratoMock.idCliente)
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

    describe('buscarPorIdCliente()', () => {
        it('deve buscar contratos por idCliente e retornar lista', async () => {
            // Arrange
            const idCliente = new Types.ObjectId().toString()
            const c1 = ContratоMother.criarValido({ idCliente })
            const c2 = ContratоMother.criarValido({ idCliente })
            await ContratoModel.create(ContratoMapper.paraDocumento(c1))
            await ContratoModel.create(ContratoMapper.paraDocumento(c2))
            // Act
            const resultado = await repository.buscarPorIdCliente(idCliente)
            // Assert
            expect(resultado).toHaveLength(2)
            expect(resultado.every(c => c.idCliente === idCliente)).toBe(true)
        })

        it('deve retornar array vazio quando cliente nao tiver contratos', async () => {
            // Arrange & Act
            const resultado = await repository.buscarPorIdCliente(new Types.ObjectId().toString())
            // Assert
            expect(resultado).toHaveLength(0)
        })
    })

    describe('buscarPorIdPrestador()', () => {
        it('deve buscar contratos por idPrestador e retornar lista', async () => {
            // Arrange
            const idPrestador = new Types.ObjectId().toString()
            const c1 = ContratоMother.criarValido({ idPrestador })
            const c2 = ContratоMother.criarValido({ idPrestador })
            await ContratoModel.create(ContratoMapper.paraDocumento(c1))
            await ContratoModel.create(ContratoMapper.paraDocumento(c2))
            // Act
            const resultado = await repository.buscarPorIdPrestador(idPrestador)
            // Assert
            expect(resultado).toHaveLength(2)
            expect(resultado.every(c => c.idPrestador === idPrestador)).toBe(true)
        })

        it('deve retornar array vazio quando prestador nao tiver contratos', async () => {
            // Arrange & Act
            const resultado = await repository.buscarPorIdPrestador(new Types.ObjectId().toString())
            // Assert
            expect(resultado).toHaveLength(0)
        })
    })

    describe('inserir()', () => {
        it('deve inserir um contrato e retorna-lo com id', async () => {
            // Arrange & Act
            const inserido = await repository.inserir(contratoMock)
            // Assert
            expect(inserido).toBeInstanceOf(Contrato)
            expect(inserido.id).toBeDefined()
            expect(inserido.status).toBe(StatusContrato.AGUARDANDO_INICIO)
            expect(inserido.idCliente).toBe(contratoMock.idCliente)
        })
    })

    describe('atualizar()', () => {
        it('deve atualizar status do contrato e retorna-lo atualizado', async () => {
            // Arrange
            const documentoInserido = await ContratoModel.create(ContratoMapper.paraDocumento(contratoMock))
            const contratoInserido = ContratoMapper.paraEntidade(documentoInserido)
            contratoInserido.status = StatusContrato.CONCLUIDO
            // Act
            const atualizado = await repository.atualizar(contratoInserido)
            // Assert
            expect(atualizado).toBeInstanceOf(Contrato)
            expect(atualizado.status).toBe(StatusContrato.CONCLUIDO)
            expect(atualizado.id).toBe(contratoInserido.id)
        })

        it('deve persistir o problema relatado e recuperá-lo corretamente', async () => {
            // Arrange
            const documentoInserido = await ContratoModel.create(ContratoMapper.paraDocumento(contratoMock))
            const contratoInserido = ContratoMapper.paraEntidade(documentoInserido)
            contratoInserido.relatarProblema('atraso', 'Descricao detalhada do problema')
            // Act
            const atualizado = await repository.atualizar(contratoInserido)
            // Assert
            expect(atualizado.problema).toBeDefined()
            expect(atualizado.problema?.tipo).toBe('atraso')
            expect(atualizado.problema?.descricao).toBe('Descricao detalhada do problema')
            expect(atualizado.problema?.dataCriacao).toBeInstanceOf(Date)
        })
    })
})
