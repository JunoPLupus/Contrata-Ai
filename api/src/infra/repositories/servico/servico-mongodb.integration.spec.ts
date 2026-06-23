import mongoose, { Types } from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import { Servico } from "../../../domain/entities/servico/servico.entity";
import { ServicoModel } from "../../models/servico/servico.model";
import { ServicoMongodbRepositoryImpl } from "./servico-mongodb.repository.impl";
import { ServicoMapper } from "./servico.mapper";
import { ServicoMother } from "../../../test-helpers/servico.mother";

describe('Testes de Integração do Repository: Serviço MongoDB', () => {

    let repository : ServicoMongodbRepositoryImpl
    let mongod : MongoMemoryServer
    let servicoMock : Servico

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

        servicoMock = ServicoMother.criarValido()
    })
    afterEach(async () => {
        const collections = mongoose.connection.collections
        for (const key in collections) {
            await collections[key].deleteMany({})
        }
    })

    it('deve buscar servico por ID e retornar servico', async () => {
        // Arrange
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
        // Arrange & Act
        const servicoInserido = await repository.inserir(servicoMock)
        // Assert
        expect(servicoInserido).not.toBeNull()
        expect(servicoInserido).toBeInstanceOf(Servico)
        expect(servicoInserido.id).not.toBeNull()
        expect(servicoInserido.id).toBeDefined()
    })

    describe('atualizar', () => {
        it('deve atualizar um servico existente e retorna-lo atualizado', async () => {
            // Arrange
            const documentoInserido = await ServicoModel.create(ServicoMapper.paraDocumento(servicoMock))
            const servicoInserido = ServicoMapper.paraEntidade(documentoInserido)
            servicoInserido.descricao = 'Descricao atualizada para o teste'
            // Act
            const servicoAtualizado = await repository.atualizar(servicoInserido)
            // Assert
            expect(servicoAtualizado).toBeInstanceOf(Servico)
            expect(servicoAtualizado.descricao).toBe('Descricao atualizada para o teste')
            expect(servicoAtualizado.id).toBe(servicoInserido.id)
        })
    })

    describe('deletar', () => {
        it('deve deletar um servico existente e nao encontra-lo depois', async () => {
            // Arrange
            const documentoInserido = await ServicoModel.create(ServicoMapper.paraDocumento(servicoMock))
            const id = documentoInserido.id.toString()
            // Act
            await repository.deletar(id)
            // Assert
            const servicoAposDelecao = await repository.buscarPorId(id)
            expect(servicoAposDelecao).toBeNull()
        })
    })
})
