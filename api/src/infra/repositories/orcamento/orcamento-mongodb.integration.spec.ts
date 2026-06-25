import mongoose, { Types } from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import { Orcamento } from "../../../domain/entities/orcamento/orcamento.entity";
import { OrcamentoModel } from "../../models/orcamento/orcamento.model";
import { OrcamentoMongodbRepositoryImpl } from "./orcamento-mongodb.repository.impl";
import { OrcamentoMapper } from "./orcamento.mapper";
import { OrcamentoMother } from "../../../test-helpers/orcamento.mother";
import { StatusOrcamento } from "../../../domain/value-objects/orcamento/status/status.vo";

describe('Testes de Integração do Repository: Orçamento MongoDB', () => {
    let repository: OrcamentoMongodbRepositoryImpl
    let mongod: MongoMemoryServer
    let orcamentoMock: Orcamento

    beforeAll(async () => {
        mongod = await MongoMemoryServer.create()
        await mongoose.connect(mongod.getUri())
    })

    afterAll(async () => {
        await mongoose.disconnect()
        await mongod.stop()
    })

    beforeEach(() => {
        repository = new OrcamentoMongodbRepositoryImpl()
        orcamentoMock = OrcamentoMother.criarValido()
    })

    afterEach(async () => {
        const collections = mongoose.connection.collections
        for (const key in collections) {
            await collections[key].deleteMany({})
        }
    })

    describe('inserir()', () => {
        it('deve inserir um orçamento e retorná-lo com id', async () => {
            // Arrange & Act
            const inserido = await repository.inserir(orcamentoMock)
            // Assert
            expect(inserido).toBeInstanceOf(Orcamento)
            expect(inserido.id).toBeDefined()
            expect(inserido.valor).toBe(orcamentoMock.valor)
            expect(inserido.status).toBe(StatusOrcamento.PENDENTE)
        })
    })

    describe('buscarPorId()', () => {
        it('deve buscar orçamento por ID e retornar entidade', async () => {
            // Arrange
            const documentoInserido = await OrcamentoModel.create(OrcamentoMapper.paraDocumento(orcamentoMock))
            // Act
            const encontrado = await repository.buscarPorId(documentoInserido.id.toString())
            // Assert
            expect(encontrado).toBeInstanceOf(Orcamento)
            expect(encontrado?.valor).toBe(orcamentoMock.valor)
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

    describe('buscarPorIdPrestador()', () => {
        it('deve buscar orçamentos por idPrestador e retornar lista', async () => {
            // Arrange
            const idPrestador = new Types.ObjectId().toString()
            const o1 = OrcamentoMother.criarValido({ idPrestador })
            const o2 = OrcamentoMother.criarValido({ idPrestador })
            await OrcamentoModel.create(OrcamentoMapper.paraDocumento(o1))
            await OrcamentoModel.create(OrcamentoMapper.paraDocumento(o2))
            // Act
            const resultado = await repository.buscarPorIdPrestador(idPrestador)
            // Assert
            expect(resultado).toHaveLength(2)
            expect(resultado.every(o => o.idPrestador === idPrestador)).toBe(true)
        })

        it('deve retornar array vazio quando prestador não tiver orçamentos', async () => {
            const resultado = await repository.buscarPorIdPrestador(new Types.ObjectId().toString())
            expect(resultado).toHaveLength(0)
        })
    })

    describe('buscarPorIdSolicitacao()', () => {
        it('deve buscar orçamentos por idSolicitacao e retornar lista', async () => {
            // Arrange
            const idSolicitacao = new Types.ObjectId().toString()
            const o1 = OrcamentoMother.criarValido({ idSolicitacao })
            const o2 = OrcamentoMother.criarValido({ idSolicitacao })
            await OrcamentoModel.create(OrcamentoMapper.paraDocumento(o1))
            await OrcamentoModel.create(OrcamentoMapper.paraDocumento(o2))
            // Act
            const resultado = await repository.buscarPorIdSolicitacao(idSolicitacao)
            // Assert
            expect(resultado).toHaveLength(2)
            expect(resultado.every(o => o.idSolicitacao === idSolicitacao)).toBe(true)
        })

        it('deve retornar array vazio quando solicitação não tiver orçamentos', async () => {
            const resultado = await repository.buscarPorIdSolicitacao(new Types.ObjectId().toString())
            expect(resultado).toHaveLength(0)
        })
    })

    describe('inserir()', () => {
        it('deve rejeitar inserção duplicada (mesmo idSolicitacao + idPrestador) com erro 11000', async () => {
            // Arrange
            const idSolicitacao = new Types.ObjectId().toString()
            const idPrestador = new Types.ObjectId().toString()
            const o1 = OrcamentoMother.criarValido({ idSolicitacao, idPrestador })
            const o2 = OrcamentoMother.criarValido({ idSolicitacao, idPrestador })
            await OrcamentoModel.create(OrcamentoMapper.paraDocumento(o1))
            // Act & Assert
            await expect(OrcamentoModel.create(OrcamentoMapper.paraDocumento(o2))).rejects.toMatchObject({ code: 11000 }) // TODO: Consertar essa linha para usar o método inserir()
        })
    })

    describe('atualizar()', () => {
        it('deve atualizar status do orçamento e retorná-lo atualizado', async () => {
            // Arrange
            const documentoInserido = await OrcamentoModel.create(OrcamentoMapper.paraDocumento(orcamentoMock))
            const orcamentoInserido = OrcamentoMapper.paraEntidade(documentoInserido)
            orcamentoInserido.status = StatusOrcamento.CANCELADO
            // Act
            const atualizado = await repository.atualizar(orcamentoInserido)
            // Assert
            expect(atualizado).toBeInstanceOf(Orcamento)
            expect(atualizado.status).toBe(StatusOrcamento.CANCELADO)
            expect(atualizado.id).toBe(orcamentoInserido.id)
        })
    })
})
