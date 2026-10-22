import mongoose, { Types } from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import { Servico } from "../../../domain/entities/servico/servico.entity";
import { ServicoModel } from "../../models/servico/servico.model";
import { ServicoMongodbRepositoryImpl } from "./servico-mongodb.repository.impl";
import { ServicoMapper } from "./servico.mapper";
import { ServicoMother } from "../../../test-helpers/servico.mother";
import { ServicoFactory } from "../../../domain/factories/servico.factory";

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

    describe('buscarPorId()', () => {
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

        it('deve persistir titulo e aceitar servico sem descricao', async () => {
            // Arrange
            const servicoSemDescricao = ServicoFactory.criar({
                idPrestador: new Types.ObjectId().toString(),
                idCategoria: new Types.ObjectId().toString(),
                titulo: 'Eletricista residencial'
            })
            const documentoInserido = await ServicoModel.create(ServicoMapper.paraDocumento(servicoSemDescricao))
            // Act
            const servico = await repository.buscarPorId(documentoInserido.id.toString())
            // Assert
            expect(documentoInserido.titulo).toBe('Eletricista residencial')
            expect(servico?.titulo).toBe('Eletricista residencial')
            expect(servico?.descricao).toBeUndefined()
        })

        it('deve persistir e ler prazo_medio_horas', async () => {
            // Arrange
            const servicoComPrazo = ServicoMother.criarValido({ prazoMedioHoras: 48 })
            const documentoInserido = await ServicoModel.create(ServicoMapper.paraDocumento(servicoComPrazo))
            // Act
            const servico = await repository.buscarPorId(documentoInserido.id.toString())
            // Assert
            expect(documentoInserido.prazo_medio_horas).toBe(48)
            expect(servico?.prazoMedioHoras).toBe(48)
        })

        it('deve retornar null quando ID nao for encontrado', async () => {
            // Arrange
            const idInexistente = new Types.ObjectId().toString()
            // Act
            const servico = await repository.buscarPorId(idInexistente)
            // Assert
            expect(servico).toBeNull()
        })
    })

    describe('buscarPorIdPrestador()', () => {
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
    })

    describe('inserir()', () => {
        it('deve inserir um servico e retorna-lo com id', async () => {
            // Arrange & Act
            const servicoInserido = await repository.inserir(servicoMock)
            // Assert
            expect(servicoInserido).not.toBeNull()
            expect(servicoInserido).toBeInstanceOf(Servico)
            expect(servicoInserido.id).not.toBeNull()
            expect(servicoInserido.id).toBeDefined()
        })
    })

    describe('atualizar()', () => {
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

    describe('atendimento_domiciliar', () => {
        it('deve gravar false por padrao e persistir true quando informado', async () => {
            // Act
            const padrao = await repository.inserir(servicoMock)
            const domiciliar = await repository.inserir(ServicoMother.criarValido({ atendimentoDomiciliar: true }))
            const documento = await ServicoModel.findById(domiciliar.id)
            // Assert
            expect(padrao.atendimentoDomiciliar).toBe(false)
            expect(domiciliar.atendimentoDomiciliar).toBe(true)
            expect(documento?.atendimento_domiciliar).toBe(true)
        })
    })

    describe('ativo', () => {
        it('deve gravar ativo = true por padrao ao inserir', async () => {
            // Act
            const servicoInserido = await repository.inserir(servicoMock)
            const documento = await ServicoModel.findById(servicoInserido.id)
            // Assert
            expect(servicoInserido.ativo).toBe(true)
            expect(documento?.ativo).toBe(true)
        })

        it('deve persistir a desativacao e a reativacao via atualizar()', async () => {
            // Arrange
            const servicoInserido = await repository.inserir(servicoMock)
            // Act
            servicoInserido.desativar()
            const desativado = await repository.atualizar(servicoInserido)
            servicoInserido.ativar()
            const reativado = await repository.atualizar(servicoInserido)
            // Assert
            expect(desativado.ativo).toBe(false)
            expect(desativado.estaOfertado()).toBe(false)
            expect(reativado.ativo).toBe(true)
        })
    })

    describe('deletar()', () => {
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
