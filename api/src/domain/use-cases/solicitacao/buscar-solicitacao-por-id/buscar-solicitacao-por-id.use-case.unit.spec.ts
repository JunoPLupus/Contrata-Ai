import { Types } from "mongoose";

import { BuscarSolicitacaoPorIdUseCase } from "./buscar-solicitacao-por-id.use-case";
import { ISolicitacaoRepository } from "../../../repositories/solicitacao.repository";
import { IServicoRepository } from "../../../repositories/servico.repository";
import { IOrcamentoRepository } from "../../../repositories/orcamento.repository";
import { Solicitacao } from "../../../entities/solicitacao/solicitacao.entity";
import { SolicitacaoMother } from "../../../../test-helpers/solicitacao.mother";
import { ServicoMother } from "../../../../test-helpers/servico.mother";
import { OrcamentoMother } from "../../../../test-helpers/orcamento.mother";
import { RecursoNaoEncontradoError } from "../../../errors/recurso-nao-encontrado.error";
import { AcessoProibidoError } from "../../../errors/acesso-proibido.error";

describe('Testes unitários do Use-Case: Buscar Solicitação por ID', () => {
    let useCase: BuscarSolicitacaoPorIdUseCase
    let solicitacaoRepositoryMock: jest.Mocked<ISolicitacaoRepository>
    let servicoRepositoryMock: jest.Mocked<IServicoRepository>
    let orcamentoRepositoryMock: jest.Mocked<IOrcamentoRepository>

    const idCliente = new Types.ObjectId().toString()
    const idPrestador = new Types.ObjectId().toString()
    const idCategoria = new Types.ObjectId().toString()
    const idSolicitacao = new Types.ObjectId().toString()

    beforeEach(() => {
        solicitacaoRepositoryMock = SolicitacaoMother.criarRepositoryMock()
        servicoRepositoryMock = ServicoMother.criarRepositoryMock()
        orcamentoRepositoryMock = OrcamentoMother.criarRepositoryMock()
        orcamentoRepositoryMock.buscarPorIdSolicitacao.mockResolvedValue([])
        useCase = new BuscarSolicitacaoPorIdUseCase(solicitacaoRepositoryMock, servicoRepositoryMock, orcamentoRepositoryMock)
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

    it('deve lançar AcessoProibidoError quando o serviço da categoria estiver pausado e não houver orçamento do prestador', async () => {
        // Arrange
        const solicitacaoMock = SolicitacaoMother.criarValido({ idCategoria })
        const servicoPausado = ServicoMother.criarValido({ idPrestador, idCategoria, ativo: false })
        solicitacaoRepositoryMock.buscarPorId.mockResolvedValue(solicitacaoMock)
        servicoRepositoryMock.buscarPorIdPrestador.mockResolvedValue([servicoPausado])
        orcamentoRepositoryMock.buscarPorIdSolicitacao.mockResolvedValue([
            OrcamentoMother.criarValido({ idSolicitacao })
        ])
        // Act & Assert
        await expect(
            useCase.execute(idSolicitacao, new Types.ObjectId().toString(), idPrestador)
        ).rejects.toThrow(AcessoProibidoError)
    })

    it('deve retornar solicitação ao prestador que já enviou orçamento, mesmo com o serviço pausado', async () => {
        // Arrange
        const solicitacaoMock = SolicitacaoMother.criarValido({ idCategoria })
        const servicoPausado = ServicoMother.criarValido({ idPrestador, idCategoria, ativo: false })
        solicitacaoRepositoryMock.buscarPorId.mockResolvedValue(solicitacaoMock)
        servicoRepositoryMock.buscarPorIdPrestador.mockResolvedValue([servicoPausado])
        orcamentoRepositoryMock.buscarPorIdSolicitacao.mockResolvedValue([
            OrcamentoMother.criarValido({ idSolicitacao, idPrestador })
        ])
        // Act
        const resultado = await useCase.execute(idSolicitacao, new Types.ObjectId().toString(), idPrestador)
        // Assert
        expect(resultado).toBeInstanceOf(Solicitacao)
        expect(orcamentoRepositoryMock.buscarPorIdSolicitacao).toHaveBeenCalledWith(idSolicitacao)
    })

    it('não deve consultar orçamentos quando a categoria de um serviço ativo já libera o acesso', async () => {
        // Arrange
        solicitacaoRepositoryMock.buscarPorId.mockResolvedValue(SolicitacaoMother.criarValido({ idCategoria }))
        servicoRepositoryMock.buscarPorIdPrestador.mockResolvedValue([ServicoMother.criarValido({ idPrestador, idCategoria })])
        // Act
        await useCase.execute(idSolicitacao, new Types.ObjectId().toString(), idPrestador)
        // Assert
        expect(orcamentoRepositoryMock.buscarPorIdSolicitacao).not.toHaveBeenCalled()
    })
})
