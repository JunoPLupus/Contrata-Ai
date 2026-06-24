import { Types } from "mongoose";

import { Servico } from "../../../entities/servico/servico.entity";
import { ServicoAtualizacaoDTO } from "../../../dto/servico/servico-atualizacao.dto";
import { IServicoRepository } from "../../../repositories/servico.repository";
import { ICategoriaRepository } from "../../../repositories/categoria.repository";
import { AtualizarServicoUseCase } from "./atualizar-servico.use-case";
import { ServicoMother } from "../../../../test-helpers/servico.mother";
import { CategoriaMother } from "../../../../test-helpers/categoria.mother";
import { RecursoNaoEncontradoError } from "../../../errors/recurso-nao-encontrado.error";
import { AcessoProibidoError } from "../../../errors/acesso-proibido.error";

describe('Testes unitários do Use-Case: Atualizar Serviço', () => {
    let atualizarServicoUseCase: AtualizarServicoUseCase
    let servicoRepositoryMock: jest.Mocked<IServicoRepository>
    let categoriaRepositoryMock: jest.Mocked<ICategoriaRepository>

    beforeEach(() => {
        servicoRepositoryMock = ServicoMother.criarRepositoryMock()
        categoriaRepositoryMock = CategoriaMother.criarRepositoryMock()
        atualizarServicoUseCase = new AtualizarServicoUseCase(servicoRepositoryMock, categoriaRepositoryMock)
    })

    it('deve atualizar e retornar o servico com os dados fornecidos', async () => {
        // Arrange
        const idPrestador = new Types.ObjectId().toString()
        const servicoMock: Servico = ServicoMother.criarValido({ idPrestador })
        const dtoAtualizacao: ServicoAtualizacaoDTO = { descricao: 'Nova descricao do servico atualizado' }
        const servicoAtualizado: Servico = ServicoMother.criarValido({ idPrestador, descricao: dtoAtualizacao.descricao })
        servicoRepositoryMock.buscarPorId.mockResolvedValue(servicoMock)
        servicoRepositoryMock.atualizar.mockResolvedValue(servicoAtualizado)
        // Act
        const resultado = await atualizarServicoUseCase.execute('qualquer-id', idPrestador, dtoAtualizacao)
        // Assert
        expect(servicoRepositoryMock.buscarPorId).toHaveBeenCalledWith('qualquer-id')
        expect(categoriaRepositoryMock.buscarPorId).not.toHaveBeenCalled()
        expect(servicoRepositoryMock.atualizar).toHaveBeenCalled()
        expect(resultado).toBeInstanceOf(Servico)
        expect(resultado.descricao).toBe(dtoAtualizacao.descricao)
    })

    it('deve validar idCategoria quando fornecido na atualização', async () => {
        // Arrange
        const idPrestador = new Types.ObjectId().toString()
        const novoIdCategoria = new Types.ObjectId().toString()
        const servicoMock: Servico = ServicoMother.criarValido({ idPrestador })
        const dtoAtualizacao: ServicoAtualizacaoDTO = { idCategoria: novoIdCategoria }
        const servicoAtualizado: Servico = ServicoMother.criarValido({ idPrestador, idCategoria: novoIdCategoria })
        servicoRepositoryMock.buscarPorId.mockResolvedValue(servicoMock)
        categoriaRepositoryMock.buscarPorId.mockResolvedValue(CategoriaMother.criarValido())
        servicoRepositoryMock.atualizar.mockResolvedValue(servicoAtualizado)
        // Act
        const resultado = await atualizarServicoUseCase.execute('qualquer-id', idPrestador, dtoAtualizacao)
        // Assert
        expect(categoriaRepositoryMock.buscarPorId).toHaveBeenCalledWith(novoIdCategoria)
        expect(servicoRepositoryMock.atualizar).toHaveBeenCalled()
        expect(resultado.idCategoria).toBe(novoIdCategoria)
    })

    it('deve lançar RecursoNaoEncontradoError quando idCategoria não existir', async () => {
        // Arrange
        const idPrestador = new Types.ObjectId().toString()
        const servicoMock: Servico = ServicoMother.criarValido({ idPrestador })
        const dtoAtualizacao: ServicoAtualizacaoDTO = { idCategoria: new Types.ObjectId().toString() }
        servicoRepositoryMock.buscarPorId.mockResolvedValue(servicoMock)
        categoriaRepositoryMock.buscarPorId.mockResolvedValue(null)
        // Act & Assert
        await expect(
            atualizarServicoUseCase.execute('qualquer-id', idPrestador, dtoAtualizacao)
        ).rejects.toThrow(RecursoNaoEncontradoError)
        expect(servicoRepositoryMock.atualizar).not.toHaveBeenCalled()
    })

    it('deve lancar RecursoNaoEncontradoError quando servico nao for encontrado', async () => {
        // Arrange
        servicoRepositoryMock.buscarPorId.mockResolvedValue(null)
        // Act & Assert
        await expect(
            atualizarServicoUseCase.execute('id-inexistente', new Types.ObjectId().toString(), {})
        ).rejects.toThrow(RecursoNaoEncontradoError)
        expect(servicoRepositoryMock.atualizar).not.toHaveBeenCalled()
    })

    it('deve lancar AcessoProibidoError quando servico nao pertencer ao prestador logado', async () => {
        // Arrange
        const idDonoPrestador = new Types.ObjectId().toString()
        const idOutroPrestador = new Types.ObjectId().toString()
        const servicoMock: Servico = ServicoMother.criarValido({ idPrestador: idDonoPrestador })
        servicoRepositoryMock.buscarPorId.mockResolvedValue(servicoMock)
        // Act & Assert
        await expect(
            atualizarServicoUseCase.execute('qualquer-id', idOutroPrestador, { descricao: 'Tentativa indevida' })
        ).rejects.toThrow(AcessoProibidoError)
        expect(servicoRepositoryMock.atualizar).not.toHaveBeenCalled()
    })
})
