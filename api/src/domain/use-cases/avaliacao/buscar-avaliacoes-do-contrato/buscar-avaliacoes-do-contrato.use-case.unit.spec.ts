import { Types } from "mongoose";
import { BuscarAvaliacoesDoContratoUseCase } from "./buscar-avaliacoes-do-contrato.use-case";
import { AvaliacaoMother } from "../../../../test-helpers/avaliacao.mother";
import { Papel } from "../../../value-objects/shared/papel/papel.vo";

describe('BuscarAvaliacoesDoContratoUseCase', () => {
    let useCase: BuscarAvaliacoesDoContratoUseCase
    let avaliacaoRepoMock: ReturnType<typeof AvaliacaoMother.criarRepositoryMock>

    beforeEach(() => {
        avaliacaoRepoMock = AvaliacaoMother.criarRepositoryMock()
        useCase = new BuscarAvaliacoesDoContratoUseCase(avaliacaoRepoMock as any)
    })

    it('deve retornar as avaliações das duas direções do contrato', async () => {
        // Arrange
        const idContrato = new Types.ObjectId().toString()
        const avaliacoes = [
            AvaliacaoMother.criarValido({ idContrato, autor: Papel.CLIENTE }),
            AvaliacaoMother.criarValido({ idContrato, autor: Papel.PRESTADOR }),
        ]
        avaliacaoRepoMock.buscarPorIdContrato.mockResolvedValue(avaliacoes)

        // Act
        const resultado = await useCase.execute(idContrato)

        // Assert
        expect(avaliacaoRepoMock.buscarPorIdContrato).toHaveBeenCalledWith(idContrato)
        expect(resultado).toBe(avaliacoes)
    })

    it('deve retornar lista vazia, sem erro, quando o contrato ainda não foi avaliado', async () => {
        // Arrange
        avaliacaoRepoMock.buscarPorIdContrato.mockResolvedValue([])

        // Act
        const resultado = await useCase.execute(new Types.ObjectId().toString())

        // Assert
        expect(resultado).toEqual([])
    })
})
