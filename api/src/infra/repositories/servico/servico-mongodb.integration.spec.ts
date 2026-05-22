import mongoose, { Types } from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import { Servico } from "../../../domain/entities/servico/servico.entity";
import { ServicoModel } from "../../models/servico/servico.model";
import { ServicoMongodbRepositoryImpl } from "./servico-mongodb.repository.impl";
import { ServicoMother } from "../../../test-helpers/servico.mother";
import { ServicoMapper } from "./servico.mapper";

describe('Servico MongoDB Repository', () => {

    let repository: ServicoMongodbRepositoryImpl
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
        repository = new ServicoMongodbRepositoryImpl()
    })
    afterEach(async () => {
        const collections = mongoose.connection.collections
        for (const key in collections) {
            await collections[key].deleteMany({})
        }
    })

    it('deve buscar servico por ID e retornar servico', async () => {
        // Arrange
        const servicoMock = ServicoMother.criarValido()
        const documentoInserido = await ServicoModel.create(ServicoMapper.paraDocumento(servicoMock))
        // Act
        const servico = await repository.buscarPorId(documentoInserido.id.toString())
        // Assert
        expect(servico).not.toBeNull()
        expect(servico).toBeInstanceOf(Servico)
        expect(servico?.descricao).toBe(servicoMock.descricao)
    })

    it('deve retornar null quando ID nao for encontrado', async () => {
        // Arrange
        const idInexistente = new Types.ObjectId().toString()
        // Act
        const servico = await repository.buscarPorId(idInexistente)
        // Assert
        expect(servico).toBeNull()
    })

    it('deve buscar servicos por idPrestador e retornar lista', async () => {
        // Arrange
        const idPrestador = new Types.ObjectId().toString()
        const servico1 = ServicoMother.criarValido({ idPrestador })
        const servico2 = ServicoMother.criarValido({ idPrestador })
        await ServicoModel.create(ServicoMapper.paraDocumento(servico1))
        await ServicoModel.create(ServicoMapper.paraDocumento(servico2))
        // Act
        const servicos = await repository.buscarPorIdPrestador(idPrestador)
        // Assert
        expect(servicos).toHaveLength(2)
        expect(servicos[0]).toBeInstanceOf(Servico)
        expect(servicos.every(s => s.idPrestador === idPrestador)).toBe(true)
    })

    it('deve retornar array vazio quando prestador nao tiver servicos', async () => {
        // Arrange
        const idPrestadorSemServico = new Types.ObjectId().toString()
        // Act
        const servicos = await repository.buscarPorIdPrestador(idPrestadorSemServico)
        // Assert
        expect(servicos).toHaveLength(0)
    })

    it('deve inserir um servico e retorna-lo com id', async () => {
        // Arrange
        const servicoMock = ServicoMother.criarValido()
        // Act
        const servicoInserido = await repository.inserir(servicoMock)
        // Assert
        expect(servicoInserido).not.toBeNull()
        expect(servicoInserido).toBeInstanceOf(Servico)
        expect(servicoInserido.id).not.toBeNull()
        expect(servicoInserido.id).toBeDefined()
    })
})
