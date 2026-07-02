import mongoose, { Types } from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import { Solicitacao } from "../../../domain/entities/solicitacao/solicitacao.entity";
import { SolicitacaoModel } from "../../models/solicitacao/solicitacao.model";
import { SolicitacaoMongodbRepositoryImpl } from "./solicitacao-mongodb.repository.impl";
import { SolicitacaoMapper } from "./solicitacao.mapper";
import { SolicitacaoMother } from "../../../test-helpers/solicitacao.mother";
import { StatusSolicitacao } from "../../../domain/value-objects/solicitacao/status/status.vo";

describe('Testes de Integração do Repository: Solicitação MongoDB', () => {
    let repository: SolicitacaoMongodbRepositoryImpl
    let mongod: MongoMemoryServer

    beforeAll(async () => {
        mongod = await MongoMemoryServer.create()
        await mongoose.connect(mongod.getUri())
    })

    afterAll(async () => {
        await mongoose.disconnect()
        await mongod.stop()
    })

    beforeEach(() => {
        repository = new SolicitacaoMongodbRepositoryImpl()
    })

    afterEach(async () => {
        const collections = mongoose.connection.collections
        for (const key in collections) {
            await collections[key].deleteMany({})
        }
    })

    describe('buscarPorId()', () => {
        it('deve buscar solicitação por ID e retornar entidade', async () => {
            // Arrange
            const solicitacaoMock = SolicitacaoMother.criarValido()
            const documentoInserido = await SolicitacaoModel.create(SolicitacaoMapper.paraDocumento(solicitacaoMock))
            // Act
            const encontrada = await repository.buscarPorId(documentoInserido.id.toString())
            // Assert
            expect(encontrada).toBeInstanceOf(Solicitacao)
            expect(encontrada?.descricao).toBe(solicitacaoMock.descricao)
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

    describe('buscarPorIdCliente()', () => {
        it('deve buscar solicitações por idCliente e retornar lista', async () => {
            // Arrange
            const idCliente = new Types.ObjectId().toString()
            const s1 = SolicitacaoMother.criarValido({ idCliente })
            const s2 = SolicitacaoMother.criarValido({ idCliente })
            await SolicitacaoModel.create(SolicitacaoMapper.paraDocumento(s1))
            await SolicitacaoModel.create(SolicitacaoMapper.paraDocumento(s2))
            // Act
            const resultado = await repository.buscarPorIdCliente(idCliente)
            // Assert
            expect(resultado).toHaveLength(2)
            expect(resultado.every(s => s.idCliente === idCliente)).toBe(true)
        })

        it('deve retornar array vazio quando cliente não tiver solicitações', async () => {
            // Arrange & Act
            const resultado = await repository.buscarPorIdCliente(new Types.ObjectId().toString())
            // Assert
            expect(resultado).toHaveLength(0)
        })
    })

    describe('buscarDisponiveisParaPrestador()', () => {
        const idPrestador = new Types.ObjectId().toString()
        const idCliente = new Types.ObjectId().toString()
        const idCategoria = new Types.ObjectId().toString()
        const idClienteExcluido = new Types.ObjectId().toString()

        it('deve retornar solicitações gerais abertas da categoria do prestador', async () => {
            // Arrange
            const geral = SolicitacaoMother.criarValido({ idCategoria })
            await SolicitacaoModel.create(SolicitacaoMapper.paraDocumento(geral))
            // Act
            const resultado = await repository.buscarDisponiveisParaPrestador(idPrestador, [idCategoria], idClienteExcluido)
            // Assert
            expect(resultado).toHaveLength(1)
            expect(resultado[0]).toBeInstanceOf(Solicitacao)
            expect(resultado[0].idPrestadorDireto).toBeUndefined()
        })

        it('deve retornar solicitações diretas endereçadas ao prestador', async () => {
            // Arrange
            const direta = SolicitacaoMother.criarValido({ idCategoria, idPrestadorDireto: idPrestador })
            await SolicitacaoModel.create(SolicitacaoMapper.paraDocumento(direta))
            // Act
            const resultado = await repository.buscarDisponiveisParaPrestador(idPrestador, [idCategoria], idClienteExcluido)
            // Assert
            expect(resultado).toHaveLength(1)
            expect(resultado[0].idPrestadorDireto).toBe(idPrestador)
        })

        it('não deve retornar solicitações diretas endereçadas a outro prestador', async () => {
            // Arrange
            const outroPrestador = new Types.ObjectId().toString()
            const diretaOutroPrestador = SolicitacaoMother.criarValido({
                idCategoria,
                idPrestadorDireto: outroPrestador
            })
            await SolicitacaoModel.create(SolicitacaoMapper.paraDocumento(diretaOutroPrestador))
            // Act
            const resultado = await repository.buscarDisponiveisParaPrestador(idPrestador, [idCategoria], idClienteExcluido)
            // Assert
            expect(resultado).toHaveLength(0)
        })

        it('não deve retornar solicitações com status diferente de aberta', async () => {
            // Arrange
            const cancelada = SolicitacaoMother.criarValido({ idCategoria, status: StatusSolicitacao.CANCELADA })
            const encerrada = SolicitacaoMother.criarValido({ idCategoria, status: StatusSolicitacao.ENCERRADA })
            await SolicitacaoModel.create(SolicitacaoMapper.paraDocumento(cancelada))
            await SolicitacaoModel.create(SolicitacaoMapper.paraDocumento(encerrada))
            // Act
            const resultado = await repository.buscarDisponiveisParaPrestador(idPrestador, [idCategoria], idClienteExcluido)
            // Assert
            expect(resultado).toHaveLength(0)
        })

        it('deve filtrar por idCategoria específica quando informada', async () => {
            // Arrange
            const outraCategoria = new Types.ObjectId().toString()
            const solicitacaoCategoria1 = SolicitacaoMother.criarValido({ idCategoria })
            const solicitacaoCategoria2 = SolicitacaoMother.criarValido({ idCategoria: outraCategoria })
            await SolicitacaoModel.create(SolicitacaoMapper.paraDocumento(solicitacaoCategoria1))
            await SolicitacaoModel.create(SolicitacaoMapper.paraDocumento(solicitacaoCategoria2))
            // Act
            const resultado = await repository.buscarDisponiveisParaPrestador(
                idPrestador,
                [idCategoria, outraCategoria],
                idClienteExcluido,
                idCategoria
            )
            // Assert
            expect(resultado).toHaveLength(1)
            expect(resultado[0].idCategoria).toBe(idCategoria)
        })

        it('deve retornar array vazio quando $in de categorias for vazio', async () => {
            // Arrange
            await SolicitacaoModel.create(SolicitacaoMapper.paraDocumento(SolicitacaoMother.criarValido({ idCategoria })))
            // Act
            const resultado = await repository.buscarDisponiveisParaPrestador(idPrestador, [], idClienteExcluido)
            // Assert
            expect(resultado).toHaveLength(0)
        })

        it('não deve retornar solicitações criadas pelo próprio cliente logado', async () => {
            // Arrange
            const solicitacaoPropria = SolicitacaoMother.criarValido({ idCategoria, idCliente })
            const solicitacaoOutro = SolicitacaoMother.criarValido({ idCategoria })
            await SolicitacaoModel.create(SolicitacaoMapper.paraDocumento(solicitacaoPropria))
            await SolicitacaoModel.create(SolicitacaoMapper.paraDocumento(solicitacaoOutro))
            // Act
            const resultado = await repository.buscarDisponiveisParaPrestador(idPrestador, [idCategoria], idCliente)
            // Assert
            expect(resultado).toHaveLength(1)
            expect(resultado[0].idCliente).not.toBe(idCliente)
        })
    })

    describe('inserir()', () => {
        it('deve inserir uma solicitação e retorná-la com id', async () => {
            // Arrange
            const solicitacaoMock = SolicitacaoMother.criarValido()
            // Act
            const inserida = await repository.inserir(solicitacaoMock)
            // Assert
            expect(inserida).toBeInstanceOf(Solicitacao)
            expect(inserida.id).toBeDefined()
            expect(inserida.descricao).toBe(solicitacaoMock.descricao)
            expect(inserida.status).toBe(StatusSolicitacao.ABERTA)
        })
    })

    describe('atualizar()', () => {
        it('deve atualizar status da solicitação e retorná-la atualizada', async () => {
            // Arrange
            const solicitacaoMock = SolicitacaoMother.criarValido()
            const documentoInserido = await SolicitacaoModel.create(SolicitacaoMapper.paraDocumento(solicitacaoMock))
            const solicitacaoInserida = SolicitacaoMapper.paraEntidade(documentoInserido)
            solicitacaoInserida.status = StatusSolicitacao.CANCELADA
            // Act
            const atualizada = await repository.atualizar(solicitacaoInserida)
            // Assert
            expect(atualizada).toBeInstanceOf(Solicitacao)
            expect(atualizada.status).toBe(StatusSolicitacao.CANCELADA)
            expect(atualizada.id).toBe(solicitacaoInserida.id)
        })
    })
})
