import { Types } from "mongoose";
import { DeletarAvaliacaoUseCase } from "./deletar-avaliacao.use-case";
import { AvaliacaoMother } from "../../../../test-helpers/avaliacao.mother";
import { Papel } from "../../../value-objects/shared/papel/papel.vo";
import { RecursoNaoEncontradoError } from "../../../errors/recurso-nao-encontrado.error";
import { AcessoProibidoError } from "../../../errors/acesso-proibido.error";
import { OperacaoNaoPermitidaError } from "../../../errors/operacao-nao-permitida.error";

describe('DeletarAvaliacaoUseCase', () => {
    let useCase: DeletarAvaliacaoUseCase
    let avaliacaoRepoMock: ReturnType<typeof AvaliacaoMother.criarRepositoryMock>

    const idCliente = new Types.ObjectId().toString()
    const idPrestador = new Types.ObjectId().toString()
    const idQualquer = () => new Types.ObjectId().toString()
    const OITO_DIAS_MS = 8 * 24 * 60 * 60 * 1000

    beforeEach(() => {
        avaliacaoRepoMock = AvaliacaoMother.criarRepositoryMock()
        avaliacaoRepoMock.deletar.mockResolvedValue(undefined)
        useCase = new DeletarAvaliacaoUseCase(avaliacaoRepoMock as any)
    })

    it('deve deletar quando o cliente logado for o autor', async () => {
        // Arrange
        const avaliacao = AvaliacaoMother.criarValido({ idCliente, idPrestador, autor: Papel.CLIENTE })
        avaliacaoRepoMock.buscarPorId.mockResolvedValue(avaliacao)

        // Act
        await useCase.execute(avaliacao.id!, idCliente)

        // Assert
        expect(avaliacaoRepoMock.deletar).toHaveBeenCalledWith(avaliacao.id)
    })

    it('deve deletar quando o prestador logado for o autor', async () => {
        // Arrange
        const avaliacao = AvaliacaoMother.criarValido({ idCliente, idPrestador, autor: Papel.PRESTADOR })
        avaliacaoRepoMock.buscarPorId.mockResolvedValue(avaliacao)

        // Act
        await useCase.execute(avaliacao.id!, idQualquer(), idPrestador)

        // Assert
        expect(avaliacaoRepoMock.deletar).toHaveBeenCalledWith(avaliacao.id)
    })

    it('deve lançar AcessoProibidoError se o avaliado (prestador) tentar deletar avaliação do cliente', async () => {
        // Arrange
        const avaliacao = AvaliacaoMother.criarValido({ idCliente, idPrestador, autor: Papel.CLIENTE })
        avaliacaoRepoMock.buscarPorId.mockResolvedValue(avaliacao)

        // Act & Assert
        await expect(useCase.execute(avaliacao.id!, idQualquer(), idPrestador))
            .rejects.toThrow(AcessoProibidoError)
        expect(avaliacaoRepoMock.deletar).not.toHaveBeenCalled()
    })

    it('deve lançar AcessoProibidoError se o avaliado (cliente) tentar deletar avaliação do prestador', async () => {
        // Arrange
        const avaliacao = AvaliacaoMother.criarValido({ idCliente, idPrestador, autor: Papel.PRESTADOR })
        avaliacaoRepoMock.buscarPorId.mockResolvedValue(avaliacao)

        // Act & Assert
        await expect(useCase.execute(avaliacao.id!, idCliente))
            .rejects.toThrow(AcessoProibidoError)
    })

    it('deve lançar RecursoNaoEncontradoError se a avaliação não existir', async () => {
        // Arrange
        avaliacaoRepoMock.buscarPorId.mockResolvedValue(null)

        // Act & Assert
        await expect(useCase.execute(idQualquer(), idCliente))
            .rejects.toThrow(RecursoNaoEncontradoError)
    })

    it('deve lançar OperacaoNaoPermitidaError se já passaram 7 dias', async () => {
        // Arrange
        const avaliacao = AvaliacaoMother.criarValido({ idCliente, dataCriacao: new Date(Date.now() - OITO_DIAS_MS) })
        avaliacaoRepoMock.buscarPorId.mockResolvedValue(avaliacao)

        // Act & Assert
        await expect(useCase.execute(avaliacao.id!, idCliente))
            .rejects.toThrow(OperacaoNaoPermitidaError)
        expect(avaliacaoRepoMock.deletar).not.toHaveBeenCalled()
    })
})
