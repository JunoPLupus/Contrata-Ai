import { Types } from "mongoose";
import { BuscarServicosDoPrestadorUseCase } from "./buscar-servicos-do-prestador.use-case";
import { PrestadorMother } from "../../../../test-helpers/prestador.mother";
import { ServicoMother } from "../../../../test-helpers/servico.mother";
import { RecursoNaoEncontradoError } from "../../../errors/recurso-nao-encontrado.error";

describe('BuscarServicosDoPrestadorUseCase', () => {
    let useCase: BuscarServicosDoPrestadorUseCase
    let servicoRepoMock: ReturnType<typeof ServicoMother.criarRepositoryMock>
    let prestadorRepoMock: ReturnType<typeof PrestadorMother.criarRepositoryMock>

    const idPrestador = new Types.ObjectId().toString()

    beforeEach(() => {
        servicoRepoMock = ServicoMother.criarRepositoryMock()
        prestadorRepoMock = PrestadorMother.criarRepositoryMock()
        useCase = new BuscarServicosDoPrestadorUseCase(servicoRepoMock as any, prestadorRepoMock as any)
    })

    it('deve retornar a lista de serviços de um prestador existente', async () => {
        // Arrange
        const prestadorMock = PrestadorMother.criarValido({ id: idPrestador })
        const servicosMock = [
            ServicoMother.criarValido({ idPrestador }),
            ServicoMother.criarValido({ idPrestador })
        ]
        prestadorRepoMock.buscarPorId.mockResolvedValue(prestadorMock)
        servicoRepoMock.buscarPorIdPrestador.mockResolvedValue(servicosMock)

        // Act
        const resultado = await useCase.execute(idPrestador)

        // Assert
        expect(prestadorRepoMock.buscarPorId).toHaveBeenCalledWith(idPrestador)
        expect(servicoRepoMock.buscarPorIdPrestador).toHaveBeenCalledWith(idPrestador)
        expect(resultado).toHaveLength(2)
    })

    it('deve retornar lista vazia quando o prestador não tiver serviços', async () => {
        // Arrange
        const prestadorMock = PrestadorMother.criarValido({ id: idPrestador })
        prestadorRepoMock.buscarPorId.mockResolvedValue(prestadorMock)
        servicoRepoMock.buscarPorIdPrestador.mockResolvedValue([])

        // Act
        const resultado = await useCase.execute(idPrestador)

        // Assert
        expect(resultado).toHaveLength(0)
    })

    it('deve lançar RecursoNaoEncontradoError quando o prestador não existir', async () => {
        // Arrange
        prestadorRepoMock.buscarPorId.mockResolvedValue(null)

        // Act & Assert
        await expect(useCase.execute(idPrestador)).rejects.toThrow(RecursoNaoEncontradoError)
        expect(servicoRepoMock.buscarPorIdPrestador).not.toHaveBeenCalled()
    })
})
