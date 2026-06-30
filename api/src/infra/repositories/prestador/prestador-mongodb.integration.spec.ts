import mongoose, { Types } from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import { PrestadorMongodbRepositoryImpl } from "./prestador-mongodb.repository.impl";
import { Prestador } from "../../../domain/entities/prestador/prestador.entity";
import { PrestadorMother } from "../../../test-helpers/prestador.mother";
import { UsuarioModel } from "../../models/usuario/usuario.model";
import { PrestadorModel } from "../../models/prestador/prestador.model";
import { ServicoModel } from "../../models/servico/servico.model";

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
        it('deve inserir um prestador e retorná-lo com id', async () => {
            // Arrange
            const prestadorMock = PrestadorMother.criarValido()
            // Act
            const prestadorInserido = await repository.inserir(prestadorMock)
            // Assert
            expect(prestadorInserido).not.toBeNull()
            expect(prestadorInserido).toBeInstanceOf(Prestador)
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

    describe('buscar()', () => {
        const criarFixture = async (nomeUsuario: string, cidade?: string, idCategoria?: Types.ObjectId) => {
            const idCliente = new Types.ObjectId()
            await UsuarioModel.create({
                _id: idCliente,
                nome: nomeUsuario,
                email: nomeUsuario.toLowerCase().replace(' ', '.') + '@email.com',
                senha: 'hash',
                localizacao_cidade: cidade,
                reputacao_flag_cancelamento: 0,
                data_cadastro: new Date(),
                ativo: true
            })
            const prestador = await PrestadorModel.create({ id_cliente: idCliente, ativo: true })
            if (idCategoria) {
                await ServicoModel.create({
                    id_prestador: prestador._id,
                    id_categoria: idCategoria,
                    descricao: 'Serviço de teste'
                })
            }
            return prestador
        }

        it('deve retornar todos os prestadores ativos sem filtros', async () => {
            // Arrange
            await criarFixture('Ana Lima', 'São Paulo')
            await criarFixture('Carlos Souza', 'Curitiba')
            // Act
            const resultado = await repository.buscar({})
            // Assert
            expect(resultado).toHaveLength(2)
            expect(resultado.every(r => r.id && r.nome)).toBe(true)
        })

        it('deve filtrar por nome parcial case-insensitive', async () => {
            // Arrange
            await criarFixture('Ana Lima', 'São Paulo')
            await criarFixture('Carlos Souza', 'Curitiba')
            // Act
            const resultado = await repository.buscar({ nomePrestador: 'ana' })
            // Assert
            expect(resultado).toHaveLength(1)
            expect(resultado[0].nome).toBe('Ana Lima')
        })

        it('deve filtrar por idCategoria', async () => {
            // Arrange
            const idCategoria = new Types.ObjectId()
            await criarFixture('Ana Lima', 'São Paulo', idCategoria)
            await criarFixture('Carlos Souza', 'Curitiba')
            // Act
            const resultado = await repository.buscar({ idCategoria: idCategoria.toString() })
            // Assert
            expect(resultado).toHaveLength(1)
            expect(resultado[0].nome).toBe('Ana Lima')
        })

        it('deve combinar filtro de nome e categoria', async () => {
            // Arrange
            const idCategoria = new Types.ObjectId()
            await criarFixture('Ana Lima', 'São Paulo', idCategoria)
            await criarFixture('Ana Souza', 'Rio de Janeiro', idCategoria)
            await criarFixture('Carlos Ferreira', 'Curitiba', idCategoria)
            // Act
            const resultado = await repository.buscar({ nomePrestador: 'ana', idCategoria: idCategoria.toString() })
            // Assert
            expect(resultado).toHaveLength(2)
            expect(resultado.every(r => r.nome.toLowerCase().includes('ana'))).toBe(true)
        })

        it('deve retornar lista vazia quando nenhum prestador casar', async () => {
            // Arrange
            await criarFixture('Ana Lima', 'São Paulo')
            // Act
            const resultado = await repository.buscar({ nomePrestador: 'Inexistente' })
            // Assert
            expect(resultado).toHaveLength(0)
        })

        it('não deve incluir prestadores inativos', async () => {
            // Arrange
            const idCliente = new Types.ObjectId()
            await UsuarioModel.create({
                _id: idCliente,
                nome: 'Prestador Inativo',
                email: 'inativo@email.com',
                senha: 'hash',
                reputacao_flag_cancelamento: 0,
                data_cadastro: new Date(),
                ativo: true
            })
            await PrestadorModel.create({ id_cliente: idCliente, ativo: false })
            // Act
            const resultado = await repository.buscar({})
            // Assert
            expect(resultado).toHaveLength(0)
        })

        it('deve retornar nome e cidade do usuário vinculado', async () => {
            // Arrange
            await criarFixture('João Silva', 'Belo Horizonte')
            // Act
            const resultado = await repository.buscar({})
            // Assert
            expect(resultado[0].nome).toBe('João Silva')
            expect(resultado[0].cidade).toBe('Belo Horizonte')
        })
    })

    describe('buscarPorCidade()', () => {
        const criarPrestadorNaCidade = async (nomeUsuario: string, cidade: string) => {
            const idCliente = new Types.ObjectId()
            await UsuarioModel.create({
                _id: idCliente,
                nome: nomeUsuario,
                email: nomeUsuario.toLowerCase().replace(' ', '.') + '@email.com',
                senha: 'hash',
                localizacao_cidade: cidade,
                reputacao_flag_cancelamento: 0,
                data_cadastro: new Date(),
                ativo: true
            })
            return PrestadorModel.create({ id_cliente: idCliente, ativo: true })
        }

        it('deve retornar prestadores da cidade informada', async () => {
            // Arrange
            await criarPrestadorNaCidade('Ana Lima', 'São Paulo')
            await criarPrestadorNaCidade('Carlos Souza', 'Curitiba')
            // Act
            const resultado = await repository.buscarPorCidade('São Paulo')
            // Assert
            expect(resultado).toHaveLength(1)
            expect(resultado[0].nome).toBe('Ana Lima')
            expect(resultado[0].cidade).toBe('São Paulo')
        })

        it('deve ser case-insensitive ao filtrar por cidade', async () => {
            // Arrange
            await criarPrestadorNaCidade('Ana Lima', 'São Paulo')
            // Act
            const resultado = await repository.buscarPorCidade('são paulo')
            // Assert
            expect(resultado).toHaveLength(1)
        })

        it('deve retornar lista vazia para cidade sem prestadores', async () => {
            // Arrange
            await criarPrestadorNaCidade('Ana Lima', 'São Paulo')
            // Act
            const resultado = await repository.buscarPorCidade('Manaus')
            // Assert
            expect(resultado).toHaveLength(0)
        })

        it('não deve incluir prestadores inativos na busca por cidade', async () => {
            // Arrange
            const idCliente = new Types.ObjectId()
            await UsuarioModel.create({
                _id: idCliente,
                nome: 'Prestador Inativo',
                email: 'inativo.cidade@email.com',
                senha: 'hash',
                localizacao_cidade: 'São Paulo',
                reputacao_flag_cancelamento: 0,
                data_cadastro: new Date(),
                ativo: true
            })
            await PrestadorModel.create({ id_cliente: idCliente, ativo: false })
            // Act
            const resultado = await repository.buscarPorCidade('São Paulo')
            // Assert
            expect(resultado).toHaveLength(0)
        })
    })
})
