import { Types } from "mongoose";
import { AtualizarAvaliacaoUseCase } from "./atualizar-avaliacao.use-case";
import { AvaliacaoMother } from "../../../../test-helpers/avaliacao.mother";
import { Papel } from "../../../value-objects/shared/papel/papel.vo";
import { RecursoNaoEncontradoError } from "../../../errors/recurso-nao-encontrado.error";
import { AcessoProibidoError } from "../../../errors/acesso-proibido.error";
import { OperacaoNaoPermitidaError } from "../../../errors/operacao-nao-permitida.error";
import { FormatoInvalidoError } from "../../../errors/formato-invalido.error";

describe('AtualizarAvaliacaoUseCase', () => {
    let useCase: AtualizarAvaliacaoUseCase
    let avaliacaoRepoMock: ReturnType<typeof AvaliacaoMother.criarRepositoryMock>

    const idCliente = new Types.ObjectId().toString()
    const idPrestador = new Types.ObjectId().toString()
    const idQualquer = () => new Types.ObjectId().toString()
    const OITO_DIAS_MS = 8 * 24 * 60 * 60 * 1000

    beforeEach(() => {
        avaliacaoRepoMock = AvaliacaoMother.criarRepositoryMock()
        avaliacaoRepoMock.atualizar.mockImplementation(async (avaliacao) => avaliacao)
        useCase = new AtualizarAvaliacaoUseCase(avaliacaoRepoMock as any)
    })

    describe('autor "cliente"', () => {
        it('deve atualizar quando o cliente logado for o autor', async () => {
            // Arrange
            const avaliacao = AvaliacaoMother.criarValido({ idCliente, idPrestador, autor: Papel.CLIENTE, nota: 5 })
            avaliacaoRepoMock.buscarPorId.mockResolvedValue(avaliacao)

            // Act
            const resultado = await useCase.execute(avaliacao.id!, { nota: 3, comentario: 'Atrasou', anonima: true }, idCliente)

            // Assert
            expect(avaliacaoRepoMock.atualizar).toHaveBeenCalledTimes(1)
            expect(resultado.nota).toBe(3)
            expect(resultado.comentario).toBe('Atrasou')
            expect(resultado.anonima).toBe(true)
            expect(resultado.dataAtualizacao).toBeInstanceOf(Date)
        })

        it('deve lançar AcessoProibidoError se o prestador avaliado tentar alterar', async () => {
            // Arrange
            const avaliacao = AvaliacaoMother.criarValido({ idCliente, idPrestador, autor: Papel.CLIENTE })
            avaliacaoRepoMock.buscarPorId.mockResolvedValue(avaliacao)

            // Act & Assert
            await expect(useCase.execute(avaliacao.id!, { nota: 1 }, idQualquer(), idPrestador))
                .rejects.toThrow(AcessoProibidoError)
            expect(avaliacaoRepoMock.atualizar).not.toHaveBeenCalled()
        })
    })

    describe('autor "prestador"', () => {
        it('deve atualizar quando o prestador logado for o autor', async () => {
            // Arrange
            const avaliacao = AvaliacaoMother.criarValido({ idCliente, idPrestador, autor: Papel.PRESTADOR })
            avaliacaoRepoMock.buscarPorId.mockResolvedValue(avaliacao)

            // Act
            const resultado = await useCase.execute(avaliacao.id!, { nota: 2 }, idQualquer(), idPrestador)

            // Assert
            expect(resultado.nota).toBe(2)
        })

        it('deve lançar AcessoProibidoError se o cliente avaliado tentar alterar', async () => {
            // Arrange
            const avaliacao = AvaliacaoMother.criarValido({ idCliente, idPrestador, autor: Papel.PRESTADOR })
            avaliacaoRepoMock.buscarPorId.mockResolvedValue(avaliacao)

            // Act & Assert
            await expect(useCase.execute(avaliacao.id!, { nota: 5 }, idCliente))
                .rejects.toThrow(AcessoProibidoError)
        })

        it('deve lançar OperacaoNaoPermitidaError se já passaram 7 dias (janela simétrica)', async () => {
            // Arrange
            const avaliacao = AvaliacaoMother.criarValido({
                idPrestador, autor: Papel.PRESTADOR, dataCriacao: new Date(Date.now() - OITO_DIAS_MS)
            })
            avaliacaoRepoMock.buscarPorId.mockResolvedValue(avaliacao)

            // Act & Assert
            await expect(useCase.execute(avaliacao.id!, { nota: 3 }, idQualquer(), idPrestador))
                .rejects.toThrow(OperacaoNaoPermitidaError)
        })
    })

    it('deve lançar RecursoNaoEncontradoError se a avaliação não existir', async () => {
        // Arrange
        avaliacaoRepoMock.buscarPorId.mockResolvedValue(null)

        // Act & Assert
        await expect(useCase.execute(idQualquer(), { nota: 3 }, idCliente))
            .rejects.toThrow(RecursoNaoEncontradoError)
    })

    it('deve lançar AcessoProibidoError se o usuário não for parte da avaliação', async () => {
        // Arrange
        const avaliacao = AvaliacaoMother.criarValido({ idCliente, idPrestador })
        avaliacaoRepoMock.buscarPorId.mockResolvedValue(avaliacao)

        // Act & Assert
        await expect(useCase.execute(avaliacao.id!, { nota: 3 }, idQualquer(), idQualquer()))
            .rejects.toThrow(AcessoProibidoError)
    })

    it('deve lançar OperacaoNaoPermitidaError se já passaram 7 dias', async () => {
        // Arrange
        const avaliacao = AvaliacaoMother.criarValido({ idCliente, dataCriacao: new Date(Date.now() - OITO_DIAS_MS) })
        avaliacaoRepoMock.buscarPorId.mockResolvedValue(avaliacao)

        // Act & Assert
        await expect(useCase.execute(avaliacao.id!, { nota: 3 }, idCliente))
            .rejects.toThrow(OperacaoNaoPermitidaError)
    })

    it('deve lançar FormatoInvalidoError se anonima não for booleano', async () => {
        // Arrange
        const avaliacao = AvaliacaoMother.criarValido({ idCliente })
        avaliacaoRepoMock.buscarPorId.mockResolvedValue(avaliacao)

        // Act & Assert
        await expect(useCase.execute(avaliacao.id!, { anonima: 1 as any }, idCliente))
            .rejects.toThrow(FormatoInvalidoError)
    })
})
