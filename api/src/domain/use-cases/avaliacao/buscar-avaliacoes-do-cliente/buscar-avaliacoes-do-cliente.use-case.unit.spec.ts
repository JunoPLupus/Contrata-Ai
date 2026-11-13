import { Types } from "mongoose";
import { BuscarAvaliacoesDoClienteUseCase } from "./buscar-avaliacoes-do-cliente.use-case";
import { AvaliacaoMother } from "../../../../test-helpers/avaliacao.mother";
import { Papel } from "../../../value-objects/shared/papel/papel.vo";
import { AcessoProibidoError } from "../../../errors/acesso-proibido.error";

describe('BuscarAvaliacoesDoClienteUseCase', () => {
    let useCase: BuscarAvaliacoesDoClienteUseCase
    let avaliacaoRepoMock: ReturnType<typeof AvaliacaoMother.criarRepositoryMock>

    const idCliente = new Types.ObjectId().toString()
    const idQualquer = () => new Types.ObjectId().toString()

    beforeEach(() => {
        avaliacaoRepoMock = AvaliacaoMother.criarRepositoryMock()
        avaliacaoRepoMock.buscarPorIdCliente.mockResolvedValue([])
        useCase = new BuscarAvaliacoesDoClienteUseCase(avaliacaoRepoMock as any)
    })

    describe('acesso', () => {
        it('deve permitir a um prestador logado', async () => {
            // Act
            await useCase.execute(idCliente, idQualquer(), idQualquer())

            // Assert
            expect(avaliacaoRepoMock.buscarPorIdCliente).toHaveBeenCalledTimes(1)
        })

        it('deve permitir ao próprio cliente', async () => {
            // Act
            await useCase.execute(idCliente, idCliente)

            // Assert
            expect(avaliacaoRepoMock.buscarPorIdCliente).toHaveBeenCalledTimes(1)
        })

        it('deve lançar AcessoProibidoError para outro cliente sem perfil de prestador', async () => {
            // Act & Assert
            await expect(useCase.execute(idCliente, idQualquer()))
                .rejects.toThrow(AcessoProibidoError)
            expect(avaliacaoRepoMock.buscarPorIdCliente).not.toHaveBeenCalled()
        })
    })

    it('deve buscar só as avaliações recebidas pelo cliente (autor "prestador")', async () => {
        // Act
        await useCase.execute(idCliente, idCliente)

        // Assert
        expect(avaliacaoRepoMock.buscarPorIdCliente).toHaveBeenCalledWith(idCliente, Papel.PRESTADOR)
    })

    it('deve retornar avaliacoes, media e total', async () => {
        // Arrange
        const avaliacoes = [
            AvaliacaoMother.criarValido({ idCliente, autor: Papel.PRESTADOR, nota: 2 }),
            AvaliacaoMother.criarValido({ idCliente, autor: Papel.PRESTADOR, nota: 5 }),
        ]
        avaliacaoRepoMock.buscarPorIdCliente.mockResolvedValue(avaliacoes)

        // Act
        const resultado = await useCase.execute(idCliente, idCliente)

        // Assert
        expect(resultado).toEqual({ avaliacoes, media: 3.5, total: 2 })
    })

    it('deve retornar media 0 e total 0 quando o cliente não tiver avaliações', async () => {
        // Act
        const resultado = await useCase.execute(idCliente, idCliente)

        // Assert
        expect(resultado).toEqual({ avaliacoes: [], media: 0, total: 0 })
    })
})
