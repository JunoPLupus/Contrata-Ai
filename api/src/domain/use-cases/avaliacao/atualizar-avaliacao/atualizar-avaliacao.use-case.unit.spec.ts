import { Types } from "mongoose";
import { AtualizarAvaliacaoUseCase } from "./atualizar-avaliacao.use-case";
import { AvaliacaoMother } from "../../../../test-helpers/avaliacao.mother";
import { RecursoNaoEncontradoError } from "../../../errors/recurso-nao-encontrado.error";
import { AcessoProibidoError } from "../../../errors/acesso-proibido.error";
import { OperacaoNaoPermitidaError } from "../../../errors/operacao-nao-permitida.error";

describe('AtualizarAvaliacaoUseCase', () => {
    let useCase: AtualizarAvaliacaoUseCase
    let avaliacaoRepoMock: ReturnType<typeof AvaliacaoMother.criarRepositoryMock>

    const idCliente = new Types.ObjectId().toString()

    beforeEach(() => {
        avaliacaoRepoMock = AvaliacaoMother.criarRepositoryMock()
        useCase = new AtualizarAvaliacaoUseCase(avaliacaoRepoMock as any)
    })

    it('deve atualizar avaliação quando dentro do prazo e autor correto', async () => {
        // Arrange
        const avaliacao = AvaliacaoMother.criarValido({ idCliente, dataCriacao: new Date() })
        avaliacaoRepoMock.buscarPorId.mockResolvedValue(avaliacao)
        avaliacaoRepoMock.atualizar.mockResolvedValue(avaliacao)

        // Act
        await useCase.execute(avaliacao.id!, idCliente, { nota: 3 })

        // Assert
        expect(avaliacaoRepoMock.atualizar).toHaveBeenCalledTimes(1)
    })

    it('deve lançar RecursoNaoEncontradoError se a avaliação não existir', async () => {
        // Arrange
        avaliacaoRepoMock.buscarPorId.mockResolvedValue(null)

        // Act & Assert
        await expect(useCase.execute(new Types.ObjectId().toString(), idCliente, { nota: 3 }))
            .rejects.toThrow(RecursoNaoEncontradoError)
    })

    it('deve lançar AcessoProibidoError se o cliente não for o autor', async () => {
        // Arrange
        const avaliacao = AvaliacaoMother.criarValido({ dataCriacao: new Date() })
        avaliacaoRepoMock.buscarPorId.mockResolvedValue(avaliacao)

        // Act & Assert
        await expect(useCase.execute(avaliacao.id!, new Types.ObjectId().toString(), { nota: 3 }))
            .rejects.toThrow(AcessoProibidoError)
    })

    it('deve lançar OperacaoNaoPermitidaError se já passaram 7 dias', async () => {
        // Arrange
        const dataAntiga = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
        const avaliacao = AvaliacaoMother.criarValido({ idCliente, dataCriacao: dataAntiga })
        avaliacaoRepoMock.buscarPorId.mockResolvedValue(avaliacao)

        // Act & Assert
        await expect(useCase.execute(avaliacao.id!, idCliente, { nota: 3 }))
            .rejects.toThrow(OperacaoNaoPermitidaError)
    })
})
