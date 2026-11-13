import mongoose, { Types } from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import { Avaliacao } from "../../../domain/entities/avaliacao/avaliacao.entity";
import { AvaliacaoModel } from "../../models/avaliacao/avaliacao.model";
import { AvaliacaoMongodbRepositoryImpl } from "./avaliacao-mongodb.repository.impl";
import { AvaliacaoMapper } from "./avaliacao.mapper";
import { AvaliacaoMother } from "../../../test-helpers/avaliacao.mother";
import { Papel } from "../../../domain/value-objects/shared/papel/papel.vo";
import { errorHandler } from "../../../http/middlewares/error-handler/error-handler.middleware";

describe('Testes de Integração do Repository: Avaliação MongoDB', () => {
    let repository: AvaliacaoMongodbRepositoryImpl
    let mongod: MongoMemoryServer
    let avaliacaoMock: Avaliacao

    beforeAll(async () => {
        mongod = await MongoMemoryServer.create()
        await mongoose.connect(mongod.getUri())
        await AvaliacaoModel.syncIndexes()
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
        it('deve buscar só as avaliações do cliente na direção informada', async () => {
            // Arrange
            const idCliente = new Types.ObjectId().toString()
            const feita1 = AvaliacaoMother.criarValido({ idCliente, autor: Papel.CLIENTE })
            const feita2 = AvaliacaoMother.criarValido({ idCliente, autor: Papel.CLIENTE })
            const recebida = AvaliacaoMother.criarValido({ idCliente, autor: Papel.PRESTADOR })
            const deOutroCliente = AvaliacaoMother.criarValido({ autor: Papel.CLIENTE })
            for (const a of [feita1, feita2, recebida, deOutroCliente]) {
                await AvaliacaoModel.create(AvaliacaoMapper.paraDocumento(a))
            }
            // Act
            const feitas = await repository.buscarPorIdCliente(idCliente, Papel.CLIENTE)
            const recebidas = await repository.buscarPorIdCliente(idCliente, Papel.PRESTADOR)
            // Assert
            expect(feitas.map(a => a.idContrato).sort()).toEqual([feita1.idContrato, feita2.idContrato].sort())
            expect(recebidas.map(a => a.idContrato)).toEqual([recebida.idContrato])
        })

        it('deve retornar array vazio quando cliente não tiver avaliações', async () => {
            // Act
            const resultado = await repository.buscarPorIdCliente(new Types.ObjectId().toString(), Papel.CLIENTE)
            // Assert
            expect(resultado).toHaveLength(0)
        })
    })

    describe('buscarPorIdPrestador()', () => {
        it('deve buscar só as avaliações do prestador na direção informada', async () => {
            // Arrange
            const idPrestador = new Types.ObjectId().toString()
            const recebida1 = AvaliacaoMother.criarValido({ idPrestador, autor: Papel.CLIENTE })
            const recebida2 = AvaliacaoMother.criarValido({ idPrestador, autor: Papel.CLIENTE })
            const feita = AvaliacaoMother.criarValido({ idPrestador, autor: Papel.PRESTADOR })
            const deOutroPrestador = AvaliacaoMother.criarValido({ autor: Papel.CLIENTE })
            for (const a of [recebida1, recebida2, feita, deOutroPrestador]) {
                await AvaliacaoModel.create(AvaliacaoMapper.paraDocumento(a))
            }
            // Act
            const recebidas = await repository.buscarPorIdPrestador(idPrestador, Papel.CLIENTE)
            const feitas = await repository.buscarPorIdPrestador(idPrestador, Papel.PRESTADOR)
            // Assert
            expect(recebidas.map(a => a.idContrato).sort()).toEqual([recebida1.idContrato, recebida2.idContrato].sort())
            expect(feitas.map(a => a.idContrato)).toEqual([feita.idContrato])
        })

        it('deve retornar array vazio quando prestador não tiver avaliações', async () => {
            // Act
            const resultado = await repository.buscarPorIdPrestador(new Types.ObjectId().toString(), Papel.CLIENTE)
            // Assert
            expect(resultado).toHaveLength(0)
        })
    })

    describe('inserir()', () => {
        it('deve inserir uma avaliação e retorná-la com id e todos os campos', async () => {
            // Arrange
            const avaliacao = AvaliacaoMother.criarValido({ autor: Papel.PRESTADOR, nota: 2, comentario: 'Sumiu', anonima: true })
            // Act
            const inserida = await repository.inserir(avaliacao)
            // Assert
            expect(inserida).toBeInstanceOf(Avaliacao)
            expect(inserida.id).toBeDefined()
            expect(inserida.idContrato).toBe(avaliacao.idContrato)
            expect(inserida.idCliente).toBe(avaliacao.idCliente)
            expect(inserida.idPrestador).toBe(avaliacao.idPrestador)
            expect(inserida.autor).toBe(Papel.PRESTADOR)
            expect(inserida.nota).toBe(2)
            expect(inserida.comentario).toBe('Sumiu')
            expect(inserida.anonima).toBe(true)
        })

        it('deve aceitar uma avaliação de cada direção no mesmo contrato', async () => {
            // Arrange
            const idContrato = new Types.ObjectId().toString()
            await repository.inserir(AvaliacaoMother.criarValido({ idContrato, autor: Papel.CLIENTE }))
            // Act
            await repository.inserir(AvaliacaoMother.criarValido({ idContrato, autor: Papel.PRESTADOR }))
            // Assert
            expect(await AvaliacaoModel.countDocuments({ id_contrato: idContrato })).toBe(2)
        })

        it('deve recusar segunda avaliação do mesmo autor no mesmo contrato pelo índice nomeado', async () => {
            // Arrange
            const idContrato = new Types.ObjectId().toString()
            await repository.inserir(AvaliacaoMother.criarValido({ idContrato, autor: Papel.CLIENTE }))

            // Act & Assert
            await expect(repository.inserir(AvaliacaoMother.criarValido({ idContrato, autor: Papel.CLIENTE })))
                .rejects.toMatchObject({ code: 11000, message: expect.stringContaining('avaliacao_contrato_autor_unico') })
        })

        it('deve traduzir o E11000 real do índice na mensagem específica do errorHandler', async () => {
            // Arrange
            const idContrato = new Types.ObjectId().toString()
            await repository.inserir(AvaliacaoMother.criarValido({ idContrato, autor: Papel.PRESTADOR }))
            const erro = await repository.inserir(AvaliacaoMother.criarValido({ idContrato, autor: Papel.PRESTADOR }))
                .catch((e: Error) => e)
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() }

            // Act
            errorHandler(erro as Error, {} as any, res as any, jest.fn())

            // Assert
            expect(res.status).toHaveBeenCalledWith(422)
            expect(res.json).toHaveBeenCalledWith({ message: 'Você já avaliou este contrato.' })
        })
    })

    describe('atualizar()', () => {
        it('deve atualizar a nota da avaliação e retorná-la atualizada', async () => {
            // Arrange
            const documentoInserido = await AvaliacaoModel.create(AvaliacaoMapper.paraDocumento(avaliacaoMock))
            const avaliacaoInserida = AvaliacaoMapper.paraEntidade(documentoInserido)
            avaliacaoInserida.atualizar({ nota: 2, anonima: true })
            // Act
            const atualizada = await repository.atualizar(avaliacaoInserida)
            // Assert
            expect(atualizada).toBeInstanceOf(Avaliacao)
            expect(atualizada.nota).toBe(2)
            expect(atualizada.anonima).toBe(true)
            expect(atualizada.autor).toBe(avaliacaoMock.autor)
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
