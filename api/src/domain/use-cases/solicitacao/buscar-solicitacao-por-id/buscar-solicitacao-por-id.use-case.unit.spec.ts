import { Types } from "mongoose";

import { BuscarSolicitacaoPorIdUseCase } from "./buscar-solicitacao-por-id.use-case";
import { ISolicitacaoRepository } from "../../../repositories/solicitacao.repository";
import { IServicoRepository } from "../../../repositories/servico.repository";
import { Solicitacao } from "../../../entities/solicitacao/solicitacao.entity";
import { SolicitacaoMother } from "../../../../test-helpers/solicitacao.mother";
import { ServicoMother } from "../../../../test-helpers/servico.mother";
import { RecursoNaoEncontradoError } from "../../../errors/recurso-nao-encontrado.error";
import { AcessoProibidoError } from "../../../errors/acesso-proibido.error";

describe('Testes unitários do Use-Case: Buscar Solicitação por ID', () => {
    let useCase: BuscarSolicitacaoPorIdUseCase
    let solicitacaoRepositoryMock: jest.Mocked<ISolicitacaoRepository>
    let servicoRepositoryMock: jest.Mocked<IServicoRepository>

    const idCliente = new Types.ObjectId().toString()
    const idPrestador = new Types.ObjectId().toString()
    const idCategoria = new Types.ObjectId().toString()
    const idSolicitacao = new Types.ObjectId().toString()

    beforeEach(() => {
        solicitacaoRepositoryMock = SolicitacaoMother.criarRepositoryMock()
        servicoRepositoryMock = ServicoMother.criarRepositoryMock()
        useCase = new BuscarSolicitacaoPorIdUseCase(solicitacaoRepositoryMock, servicoRepositoryMock)
    })

    it('deve retornar solicitação para o cliente dono', async () => {
        // Arrange
        const solicitacaoMock = SolicitacaoMother.criarValido({ idCliente, idCategoria })
        solicitacaoRepositoryMock.buscarPorId.mockResolvedValue(solicitacaoMock)
        // Act
        const resultado = await useCase.execute(idSolicitacao, idCliente)
        // Assert
        expect(resultado).toBeInstanceOf(Solicitacao)
        expect(resultado.idCliente).toBe(idCliente)
    })

    it('deve retornar solicitação direta para o prestador endereçado', async () => {
        // Arrange
        const solicitacaoMock = SolicitacaoMother.criarValido({
            idCategoria,
            idPrestadorDireto: idPrestador
        })
        solicitacaoRepositoryMock.buscarPorId.mockResolvedValue(solicitacaoMock)
        // Act
        const resultado = await useCase.execute(idSolicitacao, new Types.ObjectId().toString(), idPrestador)
        // Assert
        expect(resultado).toBeInstanceOf(Solicitacao)
    })

    it('deve retornar solicitação geral para prestador com categoria compatível', async () => {
        // Arrange
        const solicitacaoMock = SolicitacaoMother.criarValido({ idCategoria })
        const servicoMock = ServicoMother.criarValido({ idPrestador, idCategoria })
        solicitacaoRepositoryMock.buscarPorId.mockResolvedValue(solicitacaoMock)
        servicoRepositoryMock.buscarPorIdPrestador.mockResolvedValue([servicoMock])
        // Act
        const resultado = await useCase.execute(idSolicitacao, new Types.ObjectId().toString(), idPrestador)
        // Assert
        expect(resultado).toBeInstanceOf(Solicitacao)
    })

    it('deve lançar RecursoNaoEncontradoError quando solicitação não existir', async () => {
        // Arrange
        solicitacaoRepositoryMock.buscarPorId.mockResolvedValue(null)
        // Act & Assert
        await expect(useCase.execute(idSolicitacao, idCliente)).rejects.toThrow(RecursoNaoEncontradoError)
    })

    it('deve lançar AcessoProibidoError para cliente que não é dono', async () => {
        // Arrange
        const solicitacaoMock = SolicitacaoMother.criarValido({ idCategoria })
        solicitacaoRepositoryMock.buscarPorId.mockResolvedValue(solicitacaoMock)
        // Act & Assert
        await expect(
            useCase.execute(idSolicitacao, new Types.ObjectId().toString())
        ).rejects.toThrow(AcessoProibidoError)
    })

    it('deve lançar AcessoProibidoError para prestador sem categoria compatível', async () => {
        // Arrange
        const solicitacaoMock = SolicitacaoMother.criarValido({ idCategoria })
        const outraCategoria = new Types.ObjectId().toString()
        const servicoMock = ServicoMother.criarValido({ idPrestador, idCategoria: outraCategoria })
        solicitacaoRepositoryMock.buscarPorId.mockResolvedValue(solicitacaoMock)
        servicoRepositoryMock.buscarPorIdPrestador.mockResolvedValue([servicoMock])
        // Act & Assert
        await expect(
            useCase.execute(idSolicitacao, new Types.ObjectId().toString(), idPrestador)
        ).rejects.toThrow(AcessoProibidoError)
    })
})
